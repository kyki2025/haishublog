const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // 处理 API 请求
  if (req.url.startsWith('/api/')) {
    handleApiRequest(req, res);
    return;
  }
  
  // 解析 URL，去除查询参数
  const url = new URL(req.url, `http://localhost:3000`);
  const pathname = url.pathname;
  
  let filePath = path.join(__dirname, 'dist', pathname === '/' ? 'index.html' : pathname);
  
  // 只有当请求的是静态文件且不存在时，才返回 index.html
  if (!fs.existsSync(filePath)) {
    // 如果是静态资源文件（js, css, 图片等），返回 404
    const extname = path.extname(pathname);
    if (extname && ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.ico'].includes(extname)) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    // 其他路径返回 index.html（用于 SPA 路由）
    filePath = path.join(__dirname, 'dist', 'index.html');
  }

  const extname = path.extname(filePath);
  let contentType = 'text/html';

  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// 处理 API 请求
function handleApiRequest(req, res) {
  const url = new URL(req.url, `http://localhost:3000`);
  const pathname = url.pathname;
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  
  try {
    if (pathname === '/api/featured-articles') {
      const data = fs.readFileSync(path.join(__dirname, 'mock', 'featured-articles.json'), 'utf8');
      res.end(data);
    } else if (pathname === '/api/articles-by-category') {
      const data = fs.readFileSync(path.join(__dirname, 'mock', 'articles-by-category.json'), 'utf8');
      res.end(data);
    } else if (pathname === '/api/article') {
      const data = fs.readFileSync(path.join(__dirname, 'mock', 'article.json'), 'utf8');
      res.end(data);
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'API endpoint not found' }));
    }
  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Server error' }));
  }
}

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
