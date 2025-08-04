/**
 * 文章卡片组件
 * 显示文章信息，包括作者、标签、统计数据和操作按钮
 */
import { Link } from 'react-router'
import { Calendar, Eye, Heart, Clock } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import FavoriteButton from '@/components/FavoriteButton'
import { Article, User as UserType, useBlogStore } from '@/lib/store'

interface ArticleCardProps {
  article: Article
  author?: UserType
  featured?: boolean
}

export default function ArticleCard({ article, author, featured = false }: ArticleCardProps) {
  const { likeArticle } = useBlogStore()

  // 安全获取作者信息
  const safeAuthor = author || article.author || {
    name: '未知作者',
    avatar: '',
    id: 'unknown',
    email: '',
    bio: '',
    role: 'user' as const,
    createdAt: ''
  }

  /**
   * 格式化日期显示
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * 计算预计阅读时间
   */
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.split(' ').length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  /**
   * 处理点赞按钮点击
   */
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    likeArticle(article.id)
  }

  return (
    <Card className={`h-full transition-all hover:shadow-lg ${featured ? 'ring-2 ring-primary/20' : ''}`}>
      {/* 封面图片 */}
      {article.coverImage && (
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-48 w-full object-cover transition-transform hover:scale-105"
          />
          {featured && (
            <Badge className="absolute top-3 left-3" variant="secondary">
              推荐
            </Badge>
          )}
          <Badge 
            className="absolute top-3 right-3"
            variant="outline"
          >
            {article.category}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        {/* 标题 */}
        <Link to={`/article/${article.slug}`}>
          <h2 className={`font-bold leading-tight hover:text-primary transition-colors ${
            featured ? 'text-xl' : 'text-lg'
          }`}>
            {article.title}
          </h2>
        </Link>

        {/* 摘要 */}
        <p className="text-muted-foreground text-sm line-clamp-2">
          {article.excerpt}
        </p>
      </CardHeader>

      <CardContent className="pb-3">
        {/* 标签 */}
        <div className="flex flex-wrap gap-1 mb-4">
          {article.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {article.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{article.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* 作者信息 */}
        <div className="flex items-center space-x-2 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={safeAuthor.avatar} alt={safeAuthor.name} />
            <AvatarFallback>
              {safeAuthor.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{safeAuthor.name}</p>
            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
              <span className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(article.createdAt)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{calculateReadTime(article.content)} 分钟</span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          {/* 统计数据 */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{article.views}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{article.likes}</span>
            </span>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center space-x-2">
            <FavoriteButton 
              articleId={article.id}
              articleTitle={article.title}
              showText={false}
              variant="ghost"
              size="sm"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className="h-8 px-2"
            >
              <Heart className="h-4 w-4 mr-1" />
              点赞
            </Button>
            <Button asChild variant="default" size="sm">
              <Link to={`/article/${article.slug}`}>
                阅读更多
              </Link>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}