/**
 * 侧边栏组件
 * 显示分类、标签、最新文章等信息
 */
import { useMemo } from 'react'
import { Link } from 'react-router'
import { Calendar, Tag, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useBlogStore } from '@/lib/store'

interface SidebarProps {
  selectedCategory?: string | null
  onCategoryChange?: (category: string | null) => void
}

export default function Sidebar({ selectedCategory, onCategoryChange }: SidebarProps) {
  const { articles, users } = useBlogStore()

  /**
   * 获取已发布的文章
   */
  const publishedArticles = useMemo(() => {
    return articles.filter(article => article.status === 'published')
  }, [articles])

  /**
   * 分类统计
   */
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {}
    publishedArticles.forEach(article => {
      stats[article.category] = (stats[article.category] || 0) + 1
    })
    return Object.entries(stats).sort((a, b) => b[1] - a[1])
  }, [publishedArticles])

  /**
   * 热门标签
   */
  const popularTags = useMemo(() => {
    const tagCount: Record<string, number> = {}
    publishedArticles.forEach(article => {
      article.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1
      })
    })
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  }, [publishedArticles])

  /**
   * 最新文章
   */
  const recentArticles = useMemo(() => {
    return publishedArticles
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [publishedArticles])

  /**
   * 热门文章
   */
  const popularArticles = useMemo(() => {
    return publishedArticles
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
  }, [publishedArticles])

  /**
   * 格式化日期
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* 博客统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>博客统计</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{publishedArticles.length}</div>
              <div className="text-sm text-muted-foreground">文章</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{users.length}</div>
              <div className="text-sm text-muted-foreground">用户</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {publishedArticles.reduce((sum, article) => sum + article.views, 0)}
              </div>
              <div className="text-sm text-muted-foreground">总浏览</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {publishedArticles.reduce((sum, article) => sum + article.likes, 0)}
              </div>
              <div className="text-sm text-muted-foreground">总点赞</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 文章分类 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="h-5 w-5" />
            <span>文章分类</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* 所有分类选项 */}
            <Button
              variant={!selectedCategory ? "default" : "ghost"}
              className="w-full justify-between h-auto p-2"
              onClick={() => onCategoryChange?.(null)}
            >
              <span className="font-medium">所有分类</span>
              <Badge variant={!selectedCategory ? "secondary" : "outline"}>
                {publishedArticles.length}
              </Badge>
            </Button>
            
            {/* 具体分类选项 */}
            {categoryStats.map(([category, count]) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                className="w-full justify-between h-auto p-2"
                onClick={() => onCategoryChange?.(category)}
              >
                <span className="font-medium">{category}</span>
                <Badge variant={selectedCategory === category ? "secondary" : "outline"}>
                  {count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 热门标签 */}
      <Card>
        <CardHeader>
          <CardTitle>热门标签</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularTags.map(([tag, count]) => (
              <Badge 
                key={tag}
                variant="outline" 
                className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
              >
                {tag} ({count})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 最新文章 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>最新文章</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentArticles.map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="block group"
              >
                <div className="flex items-start space-x-3">
                  {article.coverImage && (
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-16 h-12 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(article.createdAt)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 热门文章 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>热门文章</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularArticles.map((article, index) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="block group"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{article.views} 浏览</span>
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 作者信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>关于作者</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Avatar className="h-16 w-16 mx-auto mb-4">
              <AvatarImage src="/api/placeholder/64/64" alt="海树" />
              <AvatarFallback>海树</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold mb-2">海树</h3>
            <p className="text-sm text-muted-foreground mb-4">
              热爱茶文化、摄影和日语学习的生活记录者。在这里分享我的思考与感悟。
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <div className="text-center">
                <div className="font-semibold">{publishedArticles.length}</div>
                <div className="text-muted-foreground">文章</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">
                  {publishedArticles.reduce((sum, article) => sum + article.views, 0)}
                </div>
                <div className="text-muted-foreground">浏览</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}