import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n KeyMacro 公式宏生成器`);
  console.log(`============================`);
  console.log(` 服务器已启动！`);
  console.log(` 请在浏览器中打开:`);
  console.log(` http://localhost:${PORT}`);
  console.log(`============================\n`);
  console.log(` 按 Ctrl+C 可停止服务器\n`);
});

// 优雅处理 Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭。再见！');
    process.exit(0);
  });

  // 5秒后强制退出，防止连接卡住
  setTimeout(() => {
    console.log('强制关闭连接...');
    process.exit(1);
  }, 5000);
});
