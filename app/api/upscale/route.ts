/** @format */

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const maxDuration = 60;

async function upscale(fileBuffer: ArrayBuffer, mimeType: string): Promise<Uint8Array> {
    const input = Buffer.from(fileBuffer as ArrayBuffer);
    const image = sharp(input);
    const meta = await image.metadata();

    const width = (meta.width ?? 512) * 2;
    const height = (meta.height ?? 512) * 2;

    return image
        .resize(width, height, {
            kernel: sharp.kernel.lanczos3,
            fastShrinkOnLoad: false,
        })
        .sharpen({
            sigma: 1.2,
            m1: 2.0,
            m2: 4.0,
        })
        .toBuffer();
}

export async function POST(req: NextRequest) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const send = (data: Record<string, unknown>) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            try {
                const formData = await req.formData();
                const files = formData.getAll("images") as File[];

                if (!files.length) {
                    send({ type: "error", message: "Không có ảnh nào được gửi lên" });
                    controller.close();
                    return;
                }

                send({ type: "start", total: files.length });

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const filename = file.name;

                    try {
                        send({ type: "processing", filename, current: i + 1, total: files.length });

                        const resultBuffer = await upscale(await file.arrayBuffer(), file.type || "image/jpeg");

                        send({
                            type: "done",
                            filename,
                            base64: Buffer.from(resultBuffer).toString("base64"),
                            current: i + 1,
                            total: files.length,
                        });
                    } catch (err) {
                        send({
                            type: "file_error",
                            filename,
                            message: err instanceof Error ? err.message : "Lỗi không xác định",
                            current: i + 1,
                            total: files.length,
                        });
                    }
                }

                send({ type: "complete" });
            } catch (err) {
                send({ type: "error", message: err instanceof Error ? err.message : "Lỗi server" });
            } finally {
                controller.close();
            }
        },
    });

    return new NextResponse(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}
