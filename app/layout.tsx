import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "酷狗Vemus音乐解析下载器",
  description: "解析酷狗Vemus/腾讯音乐分享链接，提取MP3音频并提供下载",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
