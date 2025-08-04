const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')
const { exec } = require('child_process')
const WebSocket = require('ws')

// 配置选项
const config = {
  port: 6000,
  distDir: 'dist',
  apiMockDir: 'mock',
  watchDirs: ['src', 'public'],
  hotReload: true,
  cors: true,
  logLevel: 'info' // 'debug', 'info', 'warn', 'error'
}

// 日志工具
const logger = {
  debug: (...args) => config.logLevel === 'debug' && console.log('\x1b[36m[调试]\x1b[0m', ...args),
  info: (...args) => ['debug', 'info'].includes(config.logLevel) && console.log('\x1b[32m[信息]\x1b[0m', ...args),
  warn: (...args) => ['debug', 'info', 'warn'].includes(config.logLevel) && console.log('\x1b[33m[警告]\x1b[0m', ...args),
  error: (...args) => console.log('\x1b[31m[错误]\x1b[0m', ...args)
}

// 确保必要的目录存在
const ensureDirectories = () => {
  const dirs = [config.distDir, config.apiMockDir]
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      logger.info(`创建目录: ${dir}`)
    }
  })
}

// 生成HTML文件
const generateHtml = () => {
  const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>海树的生活札记</title>
  <meta name="description" content="分享茶文化、摄影、思考与日语学习的点点滴滴">
  <link rel="stylesheet" href="main.css?v=${Date.now()}">
  ${config.hotReload ? '<script src="/hot-reload.js"></script>' : ''}
</head>
<body>
  <div id="app"></div>
  <script src="main.js?v=${Date.now()}"></script>
</body>
</html>`

  fs.writeFileSync(path.join(config.distDir, 'index.html'), htmlContent)
  logger.info('HTML文件已更新，添加了版本参数防止缓存')
}

// 生成热重载客户端脚本
const generateHotReloadScript = () => {
  const scriptContent = `
// 热重载客户端脚本
(function() {
  const socket = new WebSocket('ws://' + location.host + '/hot-reload');
  
  socket.addEventListener('message', function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'reload') {
      console.log('[热重载] 检测到文件变更，正在刷新页面...');
      window.location.reload();
    }
  });

  socket.addEventListener('close', function() {
    console.log('[热重载] 连接已断开，尝试重新连接...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  });

  socket.addEventListener('error', function() {
    console.log('[热重载] 连接错误，将在稍后重试...');
  });

  console.log('[热重载] 已连接到开发服务器');
})();
  `;
  
  fs.writeFileSync(path.join(config.distDir, 'hot-reload.js'), scriptContent)
  logger.info('热重载脚本已生成')
}

// 初始化
ensureDirectories()
generateHtml()
if (config.hotReload) {
  generateHotReloadScript()
}

// MIME类型映射
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
}

// API模拟处理
const handleApiRequest = (req, res) => {
  const parsedUrl = url.parse(req.url, true)
  const apiPath = parsedUrl.pathname.replace(/^\/api\//, '')
  const mockFilePath = path.join(config.apiMockDir, `${apiPath}.json`)
  
  if (fs.existsSync(mockFilePath)) {
    try {
      const mockData = JSON.parse(fs.readFileSync(mockFilePath, 'utf8'))
      
      // 支持延迟响应模拟真实API
      const delay = mockData._delay || 0
      delete mockData._delay
      
      setTimeout(() => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.writeHead(200)
        res.end(JSON.stringify(mockData))
        logger.debug(`API请求: ${req.url} - 已从模拟数据返回`)
      }, delay)
      
      return true
    } catch (err) {
      logger.error(`解析模拟数据失败: ${mockFilePath}`, err)
    }
  }
  
  return false
}

// 处理静态文件请求
const handleStaticRequest = (req, res) => {
  let filePath = req.url.split('?')[0] // 移除查询参数
  
  if (filePath === '/') {
    filePath = '/index.html'
  }
  
  // SPA路由支持
  if (!filePath.includes('.') && filePath !== '/index.html') {
    filePath = '/index.html'
  }
  
  const fullPath = path.join(__dirname, config.distDir, filePath)
  
  if (fs.existsSync(fullPath)) {
    try {
      const content = fs.readFileSync(fullPath)
      const ext = path.extname(filePath)
      const contentType = mimeTypes[ext] || 'application/octet-stream'
      
      // 设置响应头
      res.setHeader('Content-Type', contentType)
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
      res.setHeader('Pragma', 'no-cache')
      res.setHeader('Expires', '0')
      res.setHeader('Last-Modified', new Date().toUTCString())
      res.setHeader('ETag', Date.now().toString())
      
      res.writeHead(200)
      res.end(content)
      logger.debug(`静态文件请求: ${filePath}`)
      return true
    } catch (err) {
      logger.error(`读取文件失败: ${fullPath}`, err)
    }
  }
  
  return false
}

// HTTP服务器
const server = http.createServer((req, res) => {
  const startTime = Date.now()
  logger.debug(`收到请求: ${req.method} ${req.url}`)
  
  // 添加CORS支持
  if (config.cors) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }
  }
  
  try {
    // 处理API请求
    if (req.url.startsWith('/api/')) {
      if (handleApiRequest(req, res)) {
        return
      }
    }
    
    // 处理静态文件请求
    if (handleStaticRequest(req, res)) {
      return
    }
    
    // 404处理
    res.writeHead(404)
    res.end('文件未找到')
    logger.warn(`404: ${req.url}`)
  } catch (err) {
    // 500错误处理
    res.writeHead(500)
    res.end('服务器内部错误')
    logger.error(`500: ${req.url}`, err)
  } finally {
    const duration = Date.now() - startTime
    logger.debug(`请求处理完成: ${req.method} ${req.url} - ${duration}ms`)
  }
})

// WebSocket服务器用于热重载
let wss
if (config.hotReload) {
  wss = new WebSocket.Server({ noServer: true })
  
  wss.on('connection', (ws) => {
    logger.info('热重载客户端已连接')
    
    ws.on('close', () => {
      logger.debug('热重载客户端已断开')
    })
  })
  
  // 处理WebSocket升级请求
  server.on('upgrade', (request, socket, head) => {
    const pathname = url.parse(request.url).pathname
    
    if (pathname === '/hot-reload') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request)
      })
    } else {
      socket.destroy()
    }
  })
}

// 文件监视功能
const setupWatcher = () => {
  if (!config.hotReload) return
  
  logger.info('启动文件监视...')
  
  config.watchDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    // 使用子进程监视文件变化
    const watcher = exec(`node -e "
      const fs = require('fs');
      fs.watch('${dir}', { recursive: true }, (eventType, filename) => {
        console.log(JSON.stringify({ event: eventType, file: filename }));
      });
      console.log('watching ${dir}');
    "`)
    
    watcher.stdout.on('data', (data) => {
      try {
        if (data.includes('watching')) {
          logger.info(`监视目录: ${dir}`)
          return
        }
        
        const change = JSON.parse(data)
        logger.info(`检测到文件变更: ${change.file} (${change.event})`)
        
        // 如果是源代码文件变更，触发重新构建
        if (dir === 'src' && (change.file.endsWith('.js') || change.file.endsWith('.ts') || 
            change.file.endsWith('.jsx') || change.file.endsWith('.tsx'))) {
          logger.info('源代码变更，触发重新构建...')
          // 这里可以添加构建命令，例如 npm run build
        }
        
        // 通知所有连接的客户端重新加载
        if (wss) {
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ 
                type: 'reload',
                file: change.file
              }))
            }
          })
        }
      } catch (err) {
        // 忽略非JSON输出
      }
    })
    
    watcher.stderr.on('data', (data) => {
      logger.error(`文件监视错误: ${data}`)
    })
    
    process.on('exit', () => {
      watcher.kill()
    })
  })
}

// 启动服务器
const port = config.port
server.listen(port, () => {
  logger.info(`🚀 终极开发服务器运行在 http://localhost:${port}`)
  logger.info(`📁 静态文件目录: ${config.distDir}`)
  logger.info(`📡 API模拟目录: ${config.apiMockDir}`)
  
  if (config.hotReload) {
    logger.info('🔥 热重载已启用')
    setupWatcher()
  }
  
  if (config.cors) {
    logger.info('🌐 CORS已启用')
  }
  
  // 显示可用的API端点
  try {
    if (fs.existsSync(config.apiMockDir)) {
      const apiFiles = fs.readdirSync(config.apiMockDir).filter(file => file.endsWith('.json'))
      if (apiFiles.length > 0) {
        logger.info('📊 可用的API端点:')
        apiFiles.forEach(file => {
          const endpoint = file.replace('.json', '')
          logger.info(`   - /api/${endpoint}`)
        })
      }
    }
  } catch (err) {
    logger.error('读取API模拟目录失败', err)
  }
})

// 优雅关闭
process.on('SIGINT', () => {
  logger.info('正在关闭服务器...')
  server.close(() => {
    logger.info('服务器已关闭')
    process.exit(0)
  })
})
