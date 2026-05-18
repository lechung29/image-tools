/** @format */

type Mode = "upscale" | "remove-bg" | "both";

interface ModeSelectorProps {
    mode: Mode;
    onModeChange: (mode: Mode) => void;
    isProcessing: boolean;
}

const MODES: { id: Mode; label: string; icon: string; desc: string }[] = [
    { id: "upscale", label: "UPSCALE 2×", icon: "⬆", desc: "Phóng to ảnh gấp 2 lần" },
    { id: "remove-bg", label: "XÓA NỀN", icon: "✂", desc: "Xóa nền → PNG trong suốt" },
    { id: "both", label: "XÓA NỀN + UPSCALE", icon: "✦", desc: "Xóa nền rồi upscale 2×" },
];

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
    modeGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" },
    modeBtn: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: 5,
        padding: "16px 8px",
        background: "transparent",
        border: "none",
        borderBottom: "2px solid transparent",
        fontFamily: "var(--font)",
        color: "var(--text-dim)",
        transition: "all 0.15s ease",
        cursor: "pointer",
    },
    modeBtnActive: { background: "var(--accent-dim)", color: "var(--accent)", borderBottom: "2px solid var(--accent)" },
    modeIcon: { fontSize: 20, lineHeight: 1 },
    modeLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" },
    modeDesc: { fontSize: 9, opacity: 0.6, textAlign: "center" as const, lineHeight: 1.3 },
};

export function ModeSelector({ mode, onModeChange, isProcessing }: ModeSelectorProps) {
    return (
        <section style={styles.card}>
            <div style={styles.cardHeader}>
                <span style={styles.cardLabel}>01</span>
                <span>CHỌN CHỨC NĂNG</span>
            </div>
            <div style={styles.modeGrid}>
                {MODES.map((m, idx) => (
                    <button
                        key={m.id}
                        style={{
                            ...styles.modeBtn,
                            ...(mode === m.id ? styles.modeBtnActive : {}),
                            borderRight: idx < MODES.length - 1 ? "1px solid var(--border)" : "none",
                            opacity: isProcessing ? 0.5 : 1,
                            cursor: isProcessing ? "not-allowed" : "pointer",
                        }}
                        onClick={() => !isProcessing && onModeChange(m.id)}
                        disabled={isProcessing}
                    >
                        <span style={styles.modeIcon}>{m.icon}</span>
                        <span style={styles.modeLabel}>{m.label}</span>
                        <span style={styles.modeDesc}>{m.desc}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}
