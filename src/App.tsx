import { HashRouter, Route, Routes } from 'react-router'
import { useEffect } from 'react'
import { ThemeProvider } from '@/components/ThemeProvider'
import HomePage from './pages/Home'
import ArticleDetail from './pages/ArticleDetail'
import AdminDashboard from './pages/AdminDashboard'
import Favorites from './pages/Favorites'
import { useBlogStore } from './lib/store'
import { mockArticles, mockUsers, mockComments } from './lib/mockData'

export default function App() {
  const { users, articles } = useBlogStore()

  // 初始化mock数据
  useEffect(() => {
    const store = useBlogStore.getState()
    
    // 如果store中没有文章数据，使用mock数据
    if (store.articles.length === 0) {
      store.articles = mockArticles
    }
    
    // 如果store中没有用户数据，使用mock数据
    if (store.users.length === 0) {
      store.users = mockUsers
    }
    
    // 如果store中没有评论数据，使用mock数据
    if (store.comments.length === 0) {
      store.comments = mockComments
    }
  }, [])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/article/:slug" element={<ArticleDetail />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  )
}