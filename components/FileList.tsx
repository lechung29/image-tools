/** @format */

interface FileStatus {
    name: string;
    status: "pending" | "processing" | "done" | "error";
    processingLabel?: string;
    message?: string;
}

interface FileListProps {
    statuses: FileStatus[];
    isProcessing: boolean;
    isComplete: boolean;
    phaseLabel: string;
    files: File[];
}

const STATUS_ICON: Record<FileStatus["status"], string> = {
    pending: "○",
    processing: "◌",
    done: "●",
    error: "✕",
};

const STATUS_COLOR: Record<FileStatus["status"], string> = {
    pending: "#444",
    processing: "#ffaa00",
    done: "#39ff14",
    error: "#ff4444",
};

const styles: Record<string, React.CSSProperties> = {
    card: { border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden", background: "var(--bg-card)" },
    cardHeader: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        borderBottom: "1px solid var(--border)",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.08em",
        color: "var(--text-dim)",
    },
    cardLabel: { color: "var(--accent)", opacity: 0.6, fontSize: 10 },
    statusChip: { display: "flex", alignItems: "center", gap: 6, marginLeft: "auto", color: "#ffaa00", fontSize: 11 },
    spinner: { display: "inline-block", width: 8, height: 8, border: "1px solid #ffaa00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
    progressWrap: { display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", borderBottom: "1px solid var(--border)" },
    progressTrack: { flex: 1, height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" },
    progressFill: { height: "100%", background: "var(--accent)", borderRadius: 2, transition: "width 0.3s ease", boxShadow: "0 0 8px var(--accent-glow)" },
    progressLabel: { fontSize: 11, color: "var(--accent)", minWidth: 40, textAlign: "right" as const },
    fileList: { maxHeight: 280, overflowY: "auto" as const, padding: "4px 0" },
    fileRow: { display: "flex", alignItems: "center", gap: 10, padding: "5px 16px", borderBottom: "1px solid var(--border)" },
    fileIcon: { fontSize: 10, width: 14, flexShrink: 0 },
    fileName: { flex: 1, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
    errorMsg: { fontSize: 10, color: "#ff4444", opacity: 0.7, flexShrink: 0, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
    processingBadge: { fontSize: 10, color: "#ffaa00", flexShrink: 0, animation: "pulse 1.2s ease-in-out infinite" },
};

export function FileList({ statuses, isProcessing, isComplete, phaseLabel, files }: FileListProps) {
    if (statuses.length === 0) return null;

    const doneCount = statuses.filter((s) => s.status === "done").length;
    const errorCount = statuses.filter((s) => s.status === "error").length;
    const progress = files.length > 0 ? ((doneCount + errorCount) / files.length) * 100 : 0;

    return (
        <section style={styles.card}>
            <div style={styles.cardHeader}>
                <span style={styles.cardLabel}>03</span>
                <span>DANH SÁCH ({statuses.length})</span>
                {isProcessing && (
                    <span style={styles.statusChip}>
                        <span style={styles.spinner} />
                        {phaseLabel || "đang xử lý..."}
                    </span>
                )}
            </div>

            {(isProcessing || isComplete) && (
                <div style={styles.progressWrap}>
                    <div style={styles.progressTrack}>
                        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                    </div>
                    <span style={styles.progressLabel}>
                        {doneCount}/{files.length}
                    </span>
                </div>
            )}

            <div style={styles.fileList}>
                {statuses.map((s) => (
                    <div key={s.name} style={styles.fileRow}>
                        <span style={{ ...styles.fileIcon, color: STATUS_COLOR[s.status] }}>{STATUS_ICON[s.status]}</span>
                        <span
                            style={{
                                ...styles.fileName,
                                color: s.status === "processing" ? "#ffaa00" : s.status === "done" ? "var(--text)" : s.status === "error" ? "#ff4444" : "var(--text-dim)",
                            }}
                        >
                            {s.name}
                        </span>
                        {s.status === "error" && s.message && <span style={styles.errorMsg}>{s.message}</span>}
                        {s.status === "processing" && <span style={styles.processingBadge}>{s.processingLabel || "processing..."}</span>}
                    </div>
                ))}
            </div>
        </section>
    );
}
