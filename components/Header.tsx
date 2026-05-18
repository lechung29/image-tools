/** @format */

const styles: Record<string, React.CSSProperties> = {
    header: { borderBottom: "1px solid var(--border)", padding: "32px 24px 24px", maxWidth: 700, margin: "0 auto" },
    headerInner: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
    prompt: { color: "var(--accent)", fontSize: 12, opacity: 0.7 },
    titleBadge: { fontSize: 10, color: "var(--text-dimmer)", border: "1px solid var(--border)", padding: "1px 6px", borderRadius: 2 },
    title: { fontSize: 28, fontWeight: 700, letterSpacing: "0.1em", color: "#fff", lineHeight: 1, marginBottom: 8 },
    subtitle: { color: "var(--text-dim)", fontSize: 12 },
};

export function Header() {
    return (
        <header style={styles.header}>
            <div style={styles.headerInner}>
                <span style={styles.prompt}>~/image-tools</span>
                <span style={styles.titleBadge}>v2.0.0</span>
            </div>
            <h1 style={styles.title}>IMAGE TOOLS</h1>
            <p style={styles.subtitle}>Upscale 2× · Xóa nền · Kết hợp</p>
        </header>
    );
}
