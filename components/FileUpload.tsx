/** @format */

interface FileUploadProps {
    files: File[];
    inputRef: React.RefObject<HTMLInputElement | null>;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
    dropzone: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "40px 24px",
        cursor: "pointer",
        borderRadius: 4,
        transition: "all 0.15s ease",
        userSelect: "none",
        margin: 12,
    },
    dropIcon: { fontSize: 28, lineHeight: 1 },
    dropText: { fontSize: 13, fontWeight: 500 },
    dropHint: { fontSize: 11, color: "var(--text-dimmer)" },
};

export function FileUpload({ files, inputRef, onFileChange }: FileUploadProps) {
    const totalMB = (files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(1);

    return (
        <section style={styles.card}>
            <div style={styles.cardHeader}>
                <span style={styles.cardLabel}>02</span>
                <span>CHỌN ẢNH / THƯ MỤC</span>
            </div>
            <div
                style={{
                    ...styles.dropzone,
                    borderColor: files.length ? "var(--accent)" : "var(--border-bright)",
                    background: files.length ? "var(--accent-dim)" : "var(--bg)",
                    border: "1px dashed",
                }}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    // @ts-expect-error
                    webkitdirectory=""
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={onFileChange}
                />
                {files.length === 0 ? (
                    <>
                        <div style={styles.dropIcon}>⬡</div>
                        <div style={styles.dropText}>Click để chọn thư mục</div>
                        <div style={styles.dropHint}>hoặc kéo thư mục ảnh vào đây</div>
                    </>
                ) : (
                    <>
                        <div style={{ ...styles.dropIcon, color: "var(--accent)" }}>⬡</div>
                        <div style={{ ...styles.dropText, color: "var(--accent)" }}>{files.length} ảnh đã chọn</div>
                        <div style={styles.dropHint}>{totalMB} MB — click để chọn lại</div>
                    </>
                )}
            </div>
        </section>
    );
}
