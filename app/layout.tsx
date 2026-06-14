import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bé Mind AI",
  description: "AI Coach đồng hành cùng con lớn khôn mỗi ngày",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
