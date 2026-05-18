/** @format */

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const maxDuration = 60;

async function removeBackground(fileBuffer: ArrayBuffer, fileName: string, mimeType: string): Promise<Buffer> {
    const apiKey = process.env.REMOVEBG_API_KEY;

    if (!apiKey) {
        throw new Error("REMOVEBG_API_KEY not configured");
    }

    try {
        const formData = new FormData();
        const blob = new Blob([fileBuffer], { type: mimeType || "image/jpeg" });
        formData.append("image_file", blob, fileName);
        formData.append("size", "auto");
        formData.append("type", "auto");

        const response = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
            headers: {
                "X-API-Key": apiKey,
            },
            responseType: "arraybuffer",
        });

        return Buffer.from(response.data);
    } catch (error: any) {
        const errorMsg = error.response?.data?.errors?.[0]?.title || error.message;
        throw new Error(`remove.bg API error: ${errorMsg}`);
    }
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
                    const outName = filename.replace(/\.[^/.]+$/, "") + "_nobg.png";

                    try {
                        send({ type: "processing", filename, current: i + 1, total: files.length });

                        const resultBuffer = await removeBackground(await file.arrayBuffer(), filename, file.type || "image/jpeg");

                        send({
                            type: "done",
                            filename,
                            outName,
                            base64: resultBuffer.toString("base64"),
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
