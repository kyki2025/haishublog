import esbuild from 'esbuild'
import { createServer } from 'http'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const isProd = process.argv.includes('--production')

const esbuildOpts = {
  color: true,
  entryPoints: ['src/main.tsx'],
  outdir: 'dist',
  entryNames: 'main',
  assetNames: 'main',
  chunkNames: 'main',
  write: true,
  bundle: true,
  format: 'iife',
  sourcemap: false,
  minify: false,
  treeShaking: true,
  jsx: 'automatic',
  splitting: false,
  loader: {
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.gif': 'file',
    '.svg': 'file',
  },
  external: [],
}

// CSS处理函数
async function buildCSS() {
  const postcss = (await import('postcss')).default
  const tailwindcss = (await import('tailwindcss')).default
  const autoprefixer = (await import('autoprefixer')).default
  
  const css = readFileSync('src/shadcn.css', 'utf8')
  
  const result = await postcss([
    tailwindcss,
    autoprefixer,
  ]).process(css, { 
    from: 'src/shadcn.css',
    to: 'dist/main.css'
  })
  
  const fs = await import('fs')
  fs.writeFileSync('dist/main.css', result.css)
  
  if (result.map) {
    fs.writeFileSync('dist/main.css.map', result.map.toString())
  }
}

// HTML文件处理
async function copyHTML() {
  const fs = await import('fs')
  const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>海叔的Blog</title>
  <meta name="description" content="分享茶文化、摄影、思考与日语学习的点点滴滴">
  <link rel="stylesheet" href="main.css">
</head>
<body>
  <div id="app"></div>
  <script src="main.js"></script>
</body>
</html>`
  
  fs.writeFileSync('dist/index.html', htmlContent)
}

async function build() {
  try {
    console.log('🔨 开始构建...')
    
    // 构建JavaScript
    await esbuild.build(esbuildOpts)
    console.log('✅ JavaScript构建完成')
    
    // 构建CSS
    await buildCSS()
    console.log('✅ CSS构建完成')
    
    // 复制HTML
    copyHTML()
    console.log('✅ HTML文件生成完成')
    
    console.log('🎉 构建完成！')
    
  } catch (error) {
    console.error('❌ 构建失败:', error)
    process.exit(1)
  }
}

// 开发服务器
function createDevServer() {
  const server = createServer((req, res) => {
    // 设置CORS和缓存控制头
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')

    let filePath = req.url === '/' ? '/index.html' : req.url
    
    // SPA路由支持 - 所有非静态文件请求都返回index.html
    if (!filePath.includes('.') && filePath !== '/index.html') {
      filePath = '/index.html'
    }
    
    const fullPath = join(process.cwd(), 'dist', filePath)
    
    if (existsSync(fullPath)) {
      const content = readFileSync(fullPath)
      
      // 设置正确的Content-Type
      if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
      } else if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8')
      }
      
      res.writeHead(200)
      res.end(content)
    } else {
      res.writeHead(404)
      res.end('File not found')
    }
  })

  const port = 8000
  server.listen(port, () => {
    console.log(`\n🚀 开发服务器运行在:`)
    console.log(`   http://127.0.0.1:${port}`)
    console.log(`   http://localhost:${port}`)
  })
}

// 执行构建
if (isProd) {
  build()
} else {
  build().then(() => {
    createDevServer()
  })
}