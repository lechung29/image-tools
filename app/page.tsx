/** @format */

"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ModeSelector } from "@/components/ModeSelector";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { ActionButtons } from "@/components/ActionButtons";
import { LogBox } from "@/components/LogBox";
import { Footer } from "@/components/Footer";

type Mode = "upscale" | "remove-bg" | "both";

interface FileStatus {
    name: string;
    status: "pending" | "processing" | "done" | "error";
    processingLabel?: string;
    message?: string;
    base64?: string;
    outName?: string;
}

const MODES: { id: Mode; label: string; icon: string; desc: string }[] = [
    { id: "upscale", label: "UPSCALE 2×", icon: "⬆", desc: "Phóng to ảnh gấp 2 lần" },
    { id: "remove-bg", label: "XÓA NỀN", icon: "✂", desc: "Xóa nền → PNG trong suốt" },
    { id: "both", label: "XÓA NỀN + UPSCALE", icon: "✦", desc: "Xóa nền rồi upscale 2×" },
];

const mainStyles: Record<string, React.CSSProperties> = {
    main: { minHeight: "100vh", background: "var(--bg)", padding: "0 0 60px" },
    container: { maxWidth: 700, margin: "0 auto", padding: "24px 24px 0", display: "flex", flexDirection: "column", gap: 16 },
};

export default function Home() {
    const [files, setFiles] = useState<File[]>([]);
    const [mode, setMode] = useState<Mode>("upscale");
    const [statuses, setStatuses] = useState<FileStatus[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [completedFiles, setCompletedFiles] = useState<FileStatus[]>([]);
    const [log, setLog] = useState<string[]>([]);
    const [phaseLabel, setPhaseLabel] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);

    const addLog = (msg: string) => {
        setLog((prev) => [...prev.slice(-50), `[${new Date().toLocaleTimeString("vi-VN")}] ${msg}`]);
    };

    useEffect(() => {
        setStatuses([]);
        setIsComplete(false);
        setIsProcessing(false);
        setCompletedFiles([]);
    }, [mode]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
        setFiles(selected);
        setStatuses(selected.map((f) => ({ name: f.name, status: "pending" })));
        setIsComplete(false);
        setCompletedFiles([]);
        setLog([]);
        setPhaseLabel("");
        if (selected.length > 0) addLog(`Đã chọn ${selected.length} ảnh`);
    };

    const updateStatus = (filename: string, updates: Partial<FileStatus>) => {
        setStatuses((prev) => prev.map((s) => (s.name === filename ? { ...s, ...updates } : s)));
    };

    const streamSSE = async (url: string, formData: FormData, fileCount: number, onProcessing: (filename: string) => void, onDone: (filename: string) => void): Promise<FileStatus[]> => {
        const response = await fetch(url, { method: "POST", body: formData });
        if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        const results: FileStatus[] = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                try {
                    const event = JSON.parse(line.slice(6));
                    if (event.type === "start") {
                        addLog(`Server nhận ${event.total} ảnh, bắt đầu xử lý...`);
                    } else if (event.type === "processing") {
                        addLog(`[${event.current}/${event.total}] Đang xử lý: ${event.filename}`);
                        const basename = event.filename.split("/").pop();
                        onProcessing(basename);
                    } else if (event.type === "done") {
                        addLog(`[${event.current}/${event.total}] ✓ Xong: ${event.filename}`);
                        const basename = event.filename.split("/").pop();
                        onDone(basename);
                        results.push({
                            name: basename,
                            outName: event.outName || basename,
                            status: "done",
                            base64: event.base64,
                        });
                    } else if (event.type === "file_error") {
                        addLog(`✕ Lỗi: ${event.filename} — ${event.message}`);
                        const basename = event.filename.split("/").pop();
                        updateStatus(basename, { status: "error", message: event.message });
                    } else if (event.type === "complete") {
                        addLog(`Hoàn tất! ${results.length}/${fileCount} ảnh.`);
                    } else if (event.type === "error") {
                        addLog(`✕ Lỗi server: ${event.message}`);
                    }
                } catch {}
            }
        }
        return results;
    };

    const getFinalName = (originalName: string, m: Mode): string => {
        const base = originalName.replace(/\.[^/.]+$/, "");
        if (m === "upscale") return base + "_2x.png";
        if (m === "remove-bg") return base + "_nobg.png";
        return base + "_nobg_2x.png";
    };

    const handleProcess = async () => {
        if (!files.length || isProcessing) return;
        setIsProcessing(true);
        setIsComplete(false);
        setCompletedFiles([]);
        setStatuses(files.map((f) => ({ name: f.name, status: "pending" })));

        try {
            if (mode === "upscale") {
                addLog(`Bắt đầu upscale ${files.length} ảnh...`);
                setPhaseLabel("Upscaling...");
                const fd = new FormData();
                files.forEach((f) => fd.append("images", f));
                const results = await streamSSE(
                    "/api/upscale",
                    fd,
                    files.length,
                    (fn) => updateStatus(fn, { status: "processing", processingLabel: "upscaling..." }),
                    (fn) => updateStatus(fn, { status: "done" }),
                );
                setCompletedFiles(results.map((r) => ({ ...r, outName: getFinalName(r.name, "upscale") })));
                setIsComplete(true);
                addLog(`✓ Hoàn tất! ${results.length}/${files.length} ảnh đã upscale.`);
            } else if (mode === "remove-bg") {
                addLog(`Bắt đầu xóa nền ${files.length} ảnh...`);
                setPhaseLabel("Removing background...");
                const fd = new FormData();
                files.forEach((f) => fd.append("images", f));
                const results = await streamSSE(
                    "/api/remove-bg",
                    fd,
                    files.length,
                    (fn) => updateStatus(fn, { status: "processing", processingLabel: "xóa nền..." }),
                    (fn) => updateStatus(fn, { status: "done" }),
                );
                setCompletedFiles(results.map((r) => ({ ...r, outName: r.outName || getFinalName(r.name, "remove-bg") })));
                setIsComplete(true);
                addLog(`✓ Hoàn tất! ${results.length}/${files.length} ảnh đã xóa nền.`);
            } else if (mode === "both") {
                addLog(`── GIAI ĐOẠN 1: Xóa nền ${files.length} ảnh ──`);
                setPhaseLabel("Phase 1/2: Xóa nền...");
                const fd1 = new FormData();
                files.forEach((f) => fd1.append("images", f));
                const removedResults = await streamSSE(
                    "/api/remove-bg",
                    fd1,
                    files.length,
                    (fn) => updateStatus(fn, { status: "processing", processingLabel: "xóa nền..." }),
                    (fn) => updateStatus(fn, { status: "done" }),
                );

                if (!removedResults.length) {
                    addLog("✕ Không có ảnh nào xóa nền thành công.");
                    return;
                }

                addLog(`── GIAI ĐOẠN 2: Upscale ${removedResults.length} ảnh đã xóa nền ──`);
                setPhaseLabel("Phase 2/2: Upscaling...");

                setStatuses(
                    removedResults.map((r) => ({
                        name: r.name,
                        status: "pending",
                    })),
                );

                const pngFiles = removedResults.map((r) => {
                    const bin = atob(r.base64!);
                    const bytes = new Uint8Array(bin.length);
                    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                    return new File([bytes], r.name, { type: "image/png" });
                });

                const fd2 = new FormData();
                pngFiles.forEach((f) => fd2.append("images", f));
                const upscaledResults = await streamSSE(
                    "/api/upscale",
                    fd2,
                    pngFiles.length,
                    (fn) => updateStatus(fn, { status: "processing", processingLabel: "upscaling..." }),
                    (fn) => updateStatus(fn, { status: "done" }),
                );

                setCompletedFiles(upscaledResults.map((r) => ({ ...r, outName: getFinalName(r.name, "both") })));
                setIsComplete(true);
                addLog(`✓ Hoàn tất! ${upscaledResults.length}/${files.length} ảnh đã xóa nền + upscale.`);
            }
        } catch (err) {
            addLog(`✕ ${err instanceof Error ? err.message : "Lỗi không xác định"}`);
        } finally {
            setIsProcessing(false);
            setPhaseLabel("");
        }
    };

    const handleDownload = async () => {
        if (!completedFiles.length) return;
        addLog("Đang tạo file ZIP...");
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        for (const file of completedFiles) {
            if (file.base64) {
                const bin = atob(file.base64);
                const bytes = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                zip.file(file.outName || file.name, bytes);
            }
        }
        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = mode === "upscale" ? "upscaled_images.zip" : mode === "remove-bg" ? "removed_bg_images.zip" : "processed_images.zip";
        a.click();
        URL.revokeObjectURL(url);
        addLog(`✓ Đã tải xuống ${a.download}`);
    };

    const currentMode = MODES.find((m) => m.id === mode)!;

    return (
        <main style={mainStyles.main}>
            <Header />
            <div style={mainStyles.container}>
                <ModeSelector mode={mode} onModeChange={setMode} isProcessing={isProcessing} />
                <FileUpload files={files} inputRef={inputRef} onFileChange={handleFileChange} />
                <FileList statuses={statuses} isProcessing={isProcessing} isComplete={isComplete} phaseLabel={phaseLabel} files={files} />
                <ActionButtons
                    files={files}
                    isProcessing={isProcessing}
                    isComplete={isComplete}
                    completedFiles={completedFiles.length}
                    currentMode={currentMode}
                    onProcess={handleProcess}
                    onDownload={handleDownload}
                />
                <LogBox log={log} />
                <Footer />
            </div>
        </main>
    );
}
