/**
 * 博客首页
 * 显示文章列表，支持搜索和分类筛选
 */
import { useMemo, useState, useEffect } from 'react'
import { useLocation } from 'react-router'
import { Search, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Layout from '@/components/Layout'
import ArticleCard from '@/components/ArticleCard'
import Sidebar from '@/components/Sidebar'
import { useBlogStore } from '@/lib/store'

export default function Home() {
  const { articles } = useBlogStore()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // 滚动到页面顶部的函数
  const scrollToTop = () => {
    // 使用 requestAnimationFrame 确保DOM更新完成
    requestAnimationFrame(() => {
      // 再次使用 requestAnimationFrame 确保渲染完成
      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        })
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      })
    })
  }

  // 处理URL参数中的分类
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
      // 清除URL参数，保持首页URL干净
      window.history.replaceState({}, '', '/#/')
      
      // 等待页面完全显示后再滚动
      scrollToTop()
    }
  }, [location.search, location.pathname])

  // 处理分类变化时的滚动（统一处理所有分类变化）
  useEffect(() => {
    if (selectedCategory) {
      // 等待页面完全显示后再滚动
      scrollToTop()
    }
  }, [selectedCategory])

  // 简化分类变化处理函数
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category)
  }

  /**
   * 根据搜索和分类筛选文章
   */
  const filteredArticles = useMemo(() => {
    let filtered = articles.filter(article => article.status === 'published')

    // 按搜索关键词筛选
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query)) ||
        article.category.toLowerCase().includes(query)
      )
    }

    // 按分类筛选
    if (selectedCategory) {
      filtered = filtered.filter(article => article.category === selectedCategory)
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [articles, searchQuery, selectedCategory])

  /**
   * 推荐文章
   */
  const featuredArticles = useMemo(() => {
    return filteredArticles.filter(article => article.featured)
  }, [filteredArticles])

  /**
   * 普通文章
   */
  const regularArticles = useMemo(() => {
    return filteredArticles.filter(article => !article.featured)
  }, [filteredArticles])

  /**
   * 获取所有分类
   */
  const categories = useMemo(() => {
    const publishedArticles = articles.filter(article => article.status === 'published')
    return Array.from(new Set(publishedArticles.map(article => article.category)))
  }, [articles])

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 主要内容 */}
        <div className="lg:col-span-3">
          {/* 页面标题 */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold">海叔的Blog</h1>
                <p className="text-muted-foreground mt-2">
                  分享茶文化、摄影、思考与日语学习的点点滴滴
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon">
                  <Grid className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 搜索和筛选 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索文章、标签或分类..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select 
                value={selectedCategory || 'all'} 
                onValueChange={(value) => handleCategoryChange(value === 'all' ? null : value)}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有分类</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 搜索结果统计 */}
            {(searchQuery || selectedCategory) && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  找到 {filteredArticles.length} 篇文章
                  {searchQuery && (
                    <span>，关键词 "<strong>{searchQuery}</strong>"</span>
                  )}
                  {selectedCategory && (
                    <span>，分类 "<strong>{selectedCategory}</strong>"</span>
                  )}
                </p>
                {(searchQuery || selectedCategory) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory(null)
                    }}
                  >
                    清除筛选
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* 推荐文章 */}
          {featuredArticles.length > 0 && !searchQuery && !selectedCategory && (
            <section className="mb-12">
              <div className="flex items-center space-x-2 mb-6">
                <div className="h-6 w-1 bg-primary rounded-full" />
                <h2 className="text-2xl font-bold">精选文章</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    author={article.author}
                    featured={true}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 所有文章 / 搜索结果 */}
          <section data-results-section>
            <div className="flex items-center space-x-2 mb-6">
              <div className="h-6 w-1 bg-primary rounded-full" />
              <h2 className="text-2xl font-bold">
                {(searchQuery || selectedCategory) ? '搜索结果' : '最新文章'}
              </h2>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">没有找到相关文章</h3>
                <p className="text-muted-foreground mb-4">
                  请尝试调整搜索关键词或筛选条件
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory(null)
                  }}
                >
                  查看所有文章
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {(searchQuery || selectedCategory ? filteredArticles : regularArticles).map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    author={article.author}
                  />
                ))}
              </div>
            )}
          </section>

          {/* 加载更多按钮 */}
          {filteredArticles.length > 0 && !searchQuery && !selectedCategory && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                加载更多文章
              </Button>
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="lg:col-span-1">
          <Sidebar 
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </div>
    </Layout>
  )
}