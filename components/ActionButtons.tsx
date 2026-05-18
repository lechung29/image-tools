/** @format */

interface ActionButtonsProps {
    files: File[];
    isProcessing: boolean;
    isComplete: boolean;
    completedFiles: number;
    currentMode: { icon: string; label: string };
    onProcess: () => void;
    onDownload: () => void;
}

const styles: Record<string, React.CSSProperties> = {
    actionRow: { display: "flex", gap: 12 },
    btn: {
        padding: "12px 24px",
        fontSize: 12,
        fontFamily: "var(--font)",
        fontWeight: 600,
        letterSpacing: "0.08em",
        border: "1px solid",
        borderRadius: 3,
        cursor: "pointer",
        transition: "all 0.1s ease",
    },
    btnPrimary: { flex: 1, background: "var(--accent)", color: "#000", borderColor: "var(--accent)" },
    btnDownload: { background: "transparent", color: "var(--accent)", borderColor: "var(--accent)", padding: "12px 20px" },
};

export function ActionButtons({ files, isProcessing, isComplete, completedFiles, currentMode, onProcess, onDownload }: ActionButtonsProps) {
    return (
        <section style={styles.actionRow}>
            <button
                style={{
                    ...styles.btn,
                    ...styles.btnPrimary,
                    opacity: files.length === 0 || isProcessing ? 0.4 : 1,
                    cursor: files.length === 0 || isProcessing ? "not-allowed" : "pointer",
                }}
                onClick={onProcess}
                disabled={files.length === 0 || isProcessing}
            >
                {isProcessing ? "ĐANG XỬ LÝ..." : `${currentMode.icon} ${currentMode.label}`}
            </button>

            {isComplete && completedFiles > 0 && (
                <button style={{ ...styles.btn, ...styles.btnDownload }} onClick={onDownload}>
                    ↓ TẢI ZIP ({completedFiles} ảnh)
                </button>
            )}
        </section>
    );
}
