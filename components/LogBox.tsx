/** @format */

interface LogBoxProps {
    log: string[];
}

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
    logBox: { padding: "12px 16px", maxHeight: 180, overflowY: "auto" as const, display: "flex", flexDirection: "column" as const, gap: 2 },
    logLine: { fontSize: 11, lineHeight: 1.5 },
};

export function LogBox({ log }: LogBoxProps) {
    if (log.length === 0) return null;

    return (
        <section style={styles.card}>
            <div style={styles.cardHeader}>
                <span style={styles.cardLabel}>LOG</span>
            </div>
            <div style={styles.logBox}>
                {log.map((entry, i) => (
                    <div
                        key={i}
                        style={{
                            ...styles.logLine,
                            color: entry.includes("✕") ? "#ff4444" : entry.includes("✓") || entry.includes("Hoàn tất") ? "var(--accent)" : entry.includes("──") ? "#ffaa00" : "var(--text-dim)",
                        }}
                    >
                        {entry}
                    </div>
                ))}
            </div>
        </section>
    );
}
