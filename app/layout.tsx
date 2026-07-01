import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "音乐解析工具 - MP3提取下载",
  description: "解析腾讯音乐/酷狗分享链接，提取MP3音频并提供下载",
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
