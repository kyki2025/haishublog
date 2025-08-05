/**
 * 文章详情页面 - 完全静态版本
 * 避免所有可能的无限循环问题
 */
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react'
import { mockArticles, mockUsers, mockComments } from '@/lib/mockData'
import type { Article, User, Comment } from '@/lib/store'

export default function ArticleDetail() {
  const [article, setArticle] = useState<Article | null>(null)
  const [author, setAuthor] = useState<User | null>(null)
  const [articleComments, setArticleComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  useEffect(() => {
    // 从URL获取文章slug
    const hash = window.location.hash
    const slug = hash.split('/').pop()
    
    if (slug) {
      // 直接从mockData中查找文章
      const foundArticle = mockArticles.find(a => a.slug === slug)
      if (foundArticle) {
        setArticle(foundArticle)
        setAuthor(foundArticle.author)
        setLikesCount(foundArticle.likes || 0)
        
        // 获取文章评论
        const comments = mockComments.filter(c => c.articleId === foundArticle.id)
        setArticleComments(comments)
      }
    }
  }, []) // 空依赖数组，只在组件挂载时执行一次

  /**
   * 返回首页
   */
  const handleBack = () => {
    window.location.hash = '#/'
  }

  /**
   * 处理点赞
   */
  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  /**
   * 发表评论
   */
  const handleSubmitComment = () => {
    if (!newComment.trim() || !article) return

    const comment: Comment = {
      id: Date.now().toString(),
      articleId: article.id,
      content: newComment,
      author: {
        id: 'current-user',
        name: '游客',
        avatar: '',
        email: 'guest@example.com',
        bio: '',
        role: 'user',
        createdAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      likes: 0
    }

    setArticleComments(prev => [...prev, comment])
    setNewComment('')
  }

  /**
   * 格式化日期
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * 渲染Markdown内容
   */
  const renderMarkdown = (content: string): string => {
    if (!content) return ''
    
    // 简单的Markdown渲染
    return content
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/!\[([^\]]*)\]\(([^)]*)\)/gim, '<img alt="$1" src="$2" style="max-width: 100%; height: auto;" />')
      .replace(/\[([^\]]*)\]\(([^)]*)\)/gim, '<a href="$2">$1</a>')
      .replace(/\n/gim, '<br>')
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">文章未找到</h2>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button onClick={handleBack} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        </div>
      </div>

      {/* 文章内容 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-lg shadow-sm p-8">
          {/* 文章标题 */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          {/* 文章元信息 */}
          <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
            <Avatar className="h-12 w-12">
              <AvatarImage src={author?.avatar} alt={author?.name} />
              <AvatarFallback>
                {author?.name?.split(' ').map(n => n[0]).join('') || 'A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900">{author?.name}</div>
              <div className="text-sm text-gray-500">
                {formatDate(article.createdAt)} · {article.category}
              </div>
            </div>
          </div>

          {/* 封面图片 */}
          {article.coverImage && (
            <div className="mb-8">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* 文章摘要 */}
          {article.excerpt && (
            <div className="text-lg text-gray-600 mb-8 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              {article.excerpt}
            </div>
          )}

          {/* 文章内容 */}
          <div 
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ 
              __html: renderMarkdown(article.content) 
            }}
          />

          {/* 文章标签 */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 互动按钮 */}
          <div className="flex items-center space-x-4 py-4 border-t border-b">
            <Button
              variant={isLiked ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {likesCount}
            </Button>
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              {articleComments.length}
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              分享
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              收藏
            </Button>
          </div>
        </article>

        {/* 评论区域 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            评论 ({articleComments.length})
          </h3>

          {/* 发表评论 */}
          <div className="mb-8">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写下你的评论..."
              rows={4}
              className="mb-4"
            />
            <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
              发表评论
            </Button>
          </div>

          {/* 评论列表 */}
          <div className="space-y-6">
            {articleComments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author?.avatar} alt={comment.author?.name} />
                  <AvatarFallback>
                    {comment.author?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">{comment.author?.name}</span>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              </div>
            ))}

            {articleComments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                暂无评论，快来发表第一条评论吧！
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}