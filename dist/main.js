// 主应用入口
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  
  // 渲染应用
  renderApp(app);
  
  // 设置路由
  setupRouting();
  
  // 加载数据
  loadInitialData();
});

// 渲染应用
function renderApp(container) {
  container.innerHTML = `
    <header>
      <div class="container header-content">
        <div class="logo">
          <a href="/">海树的生活札记</a>
        </div>
        <nav>
          <ul>
            <li><a href="/" data-route="home">首页</a></li>
            <li><a href="/tea" data-route="tea">茶文化</a></li>
            <li><a href="/photography" data-route="photography">摄影</a></li>
            <li><a href="/thoughts" data-route="thoughts">思考</a></li>
            <li><a href="/japanese" data-route="japanese">日语学习</a></li>
          </ul>
        </nav>
      </div>
    </header>
    
    <main>
      <div class="container">
        <div class="search-container">
          <input type="text" class="search-box" placeholder="搜索文章、标签或分类..." id="search-input">
          <span class="search-icon">🔍</span>
        </div>
        
        <div class="main-content">
          <div class="content-area" id="page-content">
            <div class="loading">加载中...</div>
          </div>
          
          <aside class="sidebar">
            <div class="sidebar-section">
              <h3 class="sidebar-title">分类</h3>
              <ul class="category-list" id="categories-list">
                <li class="category-item">
                  <a href="/tea" class="category-link">茶文化</a>
                  <span class="category-count">12</span>
                </li>
                <li class="category-item">
                  <a href="/photography" class="category-link">摄影</a>
                  <span class="category-count">8</span>
                </li>
                <li class="category-item">
                  <a href="/thoughts" class="category-link">思考</a>
                  <span class="category-count">15</span>
                </li>
                <li class="category-item">
                  <a href="/japanese" class="category-link">日语学习</a>
                  <span class="category-count">6</span>
                </li>
              </ul>
            </div>
            
            <div class="sidebar-section">
              <h3 class="sidebar-title">热门标签</h3>
              <div class="tags-container">
                <a href="#" class="tag-item">茶道</a>
                <a href="#" class="tag-item">传统文化</a>
                <a href="#" class="tag-item">摄影技巧</a>
                <a href="#" class="tag-item">光影</a>
                <a href="#" class="tag-item">日语语法</a>
                <a href="#" class="tag-item">深度思考</a>
                <a href="#" class="tag-item">生活方式</a>
                <a href="#" class="tag-item">禅修</a>
              </div>
            </div>
            
            <div class="sidebar-section">
              <h3 class="sidebar-title">最新文章</h3>
              <ul class="recent-articles" id="recent-articles">
                <li class="recent-article-item">
                  <a href="#" class="recent-article-title">中国茶道的精髓与现代传承</a>
                  <div class="recent-article-meta">海树 · 2023年5月15日</div>
                </li>
                <li class="recent-article-item">
                  <a href="#" class="recent-article-title">摄影中的光与影：如何捕捉完美瞬间</a>
                  <div class="recent-article-meta">海树 · 2023年6月22日</div>
                </li>
                <li class="recent-article-item">
                  <a href="#" class="recent-article-title">日语学习中的关键突破点</a>
                  <div class="recent-article-meta">海树 · 2023年7月10日</div>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
    
    <footer>
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>关于博客</h3>
            <p>海树的生活札记是一个分享茶文化、摄影、思考与日语学习的个人博客。在这里，我记录着生活中的点点滴滴，分享着对传统文化的理解和现代生活的思考。</p>
          </div>
          <div class="footer-section">
            <h3>分类</h3>
            <ul>
              <li><a href="/tea">茶文化</a></li>
              <li><a href="/photography">摄影</a></li>
              <li><a href="/thoughts">思考</a></li>
              <li><a href="/japanese">日语学习</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h3>联系方式</h3>
            <ul>
              <li>邮箱: contact@haishublog.com</li>
              <li>微信: haishu_blog</li>
              <li>微博: @海树的生活札记</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2023 海树的生活札记 | 保留所有权利 | 用心记录生活的美好</p>
        </div>
      </div>
    </footer>
  `;
  
  // 设置搜索功能
  setupSearch();
}

// 设置搜索功能
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
  }
}

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 处理搜索
function handleSearch(event) {
  const query = event.target.value.trim();
  if (query.length > 0) {
    console.log('搜索:', query);
    // 这里可以实现实际的搜索功能
  }
}

// 设置路由
function setupRouting() {
  // 获取所有带有data-route属性的链接
  const routeLinks = document.querySelectorAll('[data-route]');
  
  // 为每个链接添加点击事件
  routeLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const route = link.getAttribute('data-route');
      navigateTo(route);
      
      // 更新URL但不刷新页面
      history.pushState(null, '', link.getAttribute('href'));
    });
  });
  
  // 处理浏览器的前进/后退按钮
  window.addEventListener('popstate', () => {
    const path = window.location.pathname.substring(1) || 'home';
    navigateTo(path);
  });
  
  // 初始加载正确的路由
  const initialPath = window.location.pathname.substring(1) || 'home';
  navigateTo(initialPath);
}

// 导航到指定路由
function navigateTo(route) {
  const pageContent = document.getElementById('page-content');
  pageContent.innerHTML = '<div class="loading">加载中...</div>';
  
  // 根据路由加载不同的内容
  switch(route) {
    case 'home':
      loadHomePage(pageContent);
      break;
    case 'tea':
      loadCategoryPage(pageContent, 'tea', '茶文化');
      break;
    case 'photography':
      loadCategoryPage(pageContent, 'photography', '摄影');
      break;
    case 'thoughts':
      loadCategoryPage(pageContent, 'thoughts', '思考');
      break;
    case 'japanese':
      loadCategoryPage(pageContent, 'japanese', '日语学习');
      break;
    default:
      if (route.startsWith('article/')) {
        const articleId = route.split('/')[1];
        loadArticlePage(pageContent, articleId);
      } else {
        loadNotFoundPage(pageContent);
      }
  }
}

// 加载首页
function loadHomePage(container) {
  fetch('/api/featured-articles')
    .then(response => response.json())
    .then(data => {
      container.innerHTML = `
        <h1 class="page-title">欢迎来到海树的生活札记</h1>
        <p class="page-intro">这里记录着关于茶文化、摄影、思考与日语学习的点点滴滴。每一篇文章都是生活的感悟，每一个分享都是心灵的交流。</p>
        
        <h2 style="color: #2c3e50; margin-bottom: 1.5rem; font-size: 1.5rem;">精选文章</h2>
        <div class="articles-grid">
          ${data.articles.map(article => createArticleCard(article)).join('')}
        </div>
      `;
    })
    .catch(error => {
      console.error('加载数据失败:', error);
      container.innerHTML = '<p style="text-align: center; color: #e74c3c; padding: 2rem;">加载数据失败，请稍后再试。</p>';
    });
}

// 加载分类页面
function loadCategoryPage(container, category, categoryName) {
  fetch(`/api/articles-by-category?category=${category}`)
    .then(response => response.json())
    .then(data => {
      const categoryDescriptions = {
        'tea': '探索中国茶文化的深厚底蕴，分享茶道的精神与技艺',
        'photography': '用镜头捕捉生活的美好瞬间，分享摄影的技巧与心得',
        'thoughts': '记录生活中的思考与感悟，探讨人生的意义与价值',
        'japanese': '分享日语学习的方法与经验，感受日本文化的魅力'
      };
      
      container.innerHTML = `
        <h1 class="page-title">${categoryName}</h1>
        <p class="page-intro">${categoryDescriptions[category] || ''}</p>
        <div class="articles-grid">
          ${data.articles.map(article => createArticleCard(article)).join('')}
        </div>
      `;
    })
    .catch(error => {
      console.error('加载数据失败:', error);
      container.innerHTML = '<p style="text-align: center; color: #e74c3c; padding: 2rem;">加载数据失败，请稍后再试。</p>';
    });
}

// 加载文章页面
function loadArticlePage(container, articleId) {
  fetch(`/api/article?id=${articleId}`)
    .then(response => response.json())
    .then(article => {
      container.innerHTML = `
        <article class="full-article">
          <span class="article-category">${article.category}</span>
          <h1>${article.title}</h1>
          <div class="article-meta">
            <span>作者: ${article.author}</span>
            <span>发布于: ${formatDate(article.date)}</span>
            ${article.views ? `<span>阅读: ${article.views}</span>` : ''}
            ${article.likes ? `<span>点赞: ${article.likes}</span>` : ''}
          </div>
          <div class="article-content">
            ${article.content}
          </div>
        </article>
      `;
    })
    .catch(error => {
      console.error('加载文章失败:', error);
      container.innerHTML = '<p style="text-align: center; color: #e74c3c; padding: 2rem;">加载文章失败，请稍后再试。</p>';
    });
}

// 加载404页面
function loadNotFoundPage(container) {
  container.innerHTML = `
    <div class="not-found">
      <h1>404 - 页面未找到</h1>
      <p>抱歉，您访问的页面不存在。</p>
      <a href="/" class="btn">返回首页</a>
    </div>
  `;
}

// 创建文章卡片
function createArticleCard(article) {
  return `
    <div class="article-card" onclick="navigateToArticle('${article.id}')">
      <div class="article-image">
        <img src="${article.image}" alt="${article.title}" loading="lazy">
      </div>
      <div class="article-card-content">
        <span class="article-category">${article.category}</span>
        <h3 class="article-title">${article.title}</h3>
        <p class="article-excerpt">${article.excerpt}</p>
        <div class="article-meta">
          <div class="article-author">
            <span>👤 ${article.author}</span>
            <span>📅 ${formatDate(article.date)}</span>
          </div>
          <div class="article-stats">
            ${article.views ? `<span class="stat-item">👁️ ${article.views}</span>` : ''}
            ${article.likes ? `<span class="stat-item">❤️ ${article.likes}</span>` : ''}
            ${article.comments ? `<span class="stat-item">💬 ${article.comments.length}</span>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

// 导航到文章页面
function navigateToArticle(articleId) {
  const url = `/article/${articleId}`;
  history.pushState(null, '', url);
  navigateTo(`article/${articleId}`);
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// 加载初始数据
function loadInitialData() {
  console.log('正在加载初始数据...');
  // 这里可以加载全局需要的数据，比如更新侧边栏的统计信息
  updateSidebarStats();
}

// 更新侧边栏统计信息
function updateSidebarStats() {
  // 这里可以从API获取真实的统计数据
  // 目前使用模拟数据
}