/** @format */

const styles: Record<string, React.CSSProperties> = {
    footer: { display: "flex", gap: 12, alignItems: "center", fontSize: 11, color: "var(--text-dimmer)", paddingTop: 8 },
};

export function Footer() {
    return (
        <footer style={styles.footer}>
            <span>Upscale: sharp/lanczos3</span>
            <span style={{ color: "var(--text-dimmer)" }}>•</span>
            <span>Remove BG: remove.bg</span>
            <span style={{ color: "var(--text-dimmer)" }}>•</span>
            <span>Output: PNG</span>
        </footer>
    );
}
