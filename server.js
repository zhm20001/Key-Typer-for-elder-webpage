import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径 (ES Module 写法)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Render 会自动注入 PORT 环境变量，本地运行时默认 3000
const port = process.env.PORT || 3000;

// 托管 Vite 构建生成的 dist 目录
app.use(express.static(path.join(__dirname, 'dist')));

// 处理单页应用 (SPA) 的路由
// 无论用户访问什么路径，都返回 index.html，让 React 路由在前端接管
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 启动服务器监听端口
app.listen(port, () => {
  console.log(`Web Service is running on port ${port}`);
});