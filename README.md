# 音乐解析工具

解析腾讯音乐/酷狗分享链接，提取 MP3 音频并提供下载。

## 技术栈

- Next.js 15 + React 19
- TypeScript
- Tailwind CSS
- Puppeteer Core + @sparticuz/chromium (Vercel 适配)

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 部署到 Vercel

1. 推送到 GitHub
2. 在 Vercel 导入项目
3. 自动部署

## 支持的链接格式

- `https://t.tencentmusic.com/v/xxx` (腾讯音乐短链)
- `https://activity.kugou.com/...` (酷狗活动页)
- `https://vemus-h5.tencentmusic.com/...` (酷狗H5分享页)

## 注意事项

- Vercel Hobby 计划函数超时 10 秒，建议升级到 Pro 计划
- 部分音频链接有签名过期机制，请及时下载
- 仅供学习研究使用
