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
  const { setArticles, users, articles } = useBlogStore()

  // Inicializar dados mock na primeira renderização
  useEffect(() => {
    if (articles.length === 0) {
      setArticles(mockArticles)
    }
    
    // Garantir que os usuários mock estão no store
    const store = useBlogStore.getState()
    if (store.users.length === 0) {
      store.users = mockUsers
    }
  }, [setArticles, articles.length])

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