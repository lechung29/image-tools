/** @format */

import type { Metadata } from "next";
import "./globals.css"

export const metadata: Metadata = {
    title: "Image Tools",
    description: "Upscale ảnh 2× và xóa nền",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="vi">
            <body>{children}</body>
        </html>
    );
}
