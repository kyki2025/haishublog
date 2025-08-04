/**
 * Página de detalhes do artigo
 * Exibe conteúdo completo, comentários, informações do autor e sistema de compartilhamento
 */
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { ArrowLeft, Calendar, Clock, Eye, Heart, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import Layout from '@/components/Layout'
import ShareButton from '@/components/ShareButton'
import FavoriteButton from '@/components/FavoriteButton'
import { useBlogStore, Article, User as UserType, Comment } from '@/lib/store'
import { mockUsers, mockComments } from '@/lib/mockData'

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { articles, incrementViews, likeArticle, addComment, currentUser } = useBlogStore()
  const [article, setArticle] = useState<Article | null>(null)
  const [author, setAuthor] = useState<UserType | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    if (slug) {
      const foundArticle = articles.find(a => a.slug === slug)
      if (foundArticle) {
        setArticle(foundArticle)
        incrementViews(foundArticle.id)
        
        // Buscar autor
        const foundAuthor = mockUsers.find(u => u.id === foundArticle.authorId)
        setAuthor(foundAuthor || null)
        
        // Buscar comentários
        const articleComments = mockComments.filter(c => c.articleId === foundArticle.id)
        setComments(articleComments)
      }
    }
  }, [slug, articles, incrementViews])

  /**
   * Formatar data para exibição
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  /**
   * Calcular tempo estimado de leitura
   */
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.split(' ').length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  /**
   * Manipular curtir artigo
   */
  const handleLike = () => {
    if (article) {
      likeArticle(article.id)
      setIsLiked(!isLiked)
    }
  }

  /**
   * Enviar comentário
   */
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim() && article && currentUser) {
      const comment: Comment = {
        id: Date.now().toString(),
        articleId: article.id,
        userId: currentUser.id,
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
        likes: 0
      }
      
      addComment(comment)
      setComments([...comments, comment])
      setNewComment('')
    }
  }

  /**
   * Obter usuário por ID
   */
  const getUserById = (userId: string) => {
    return mockUsers.find(u => u.id === userId)
  }

  if (!article || !author) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Artigo não encontrado</h1>
            <Button asChild>
              <Link to="/">Voltar para o início</Link>
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  // URL completa do artigo para compartilhamento
  const articleUrl = `${window.location.origin}/#/article/${article.slug}`

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Navegação */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar aos artigos</span>
            </Link>
          </Button>
        </div>

        {/* Header do Artigo */}
        <article className="mb-8">
          {/* Meta informações */}
          <div className="mb-6">
            <Badge variant="secondary" className="mb-3">
              {article.category}
            </Badge>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              {article.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {article.excerpt}
            </p>

            {/* Informações do autor e data */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={author.avatar} alt={author.name} />
                  <AvatarFallback>
                    {author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{author.name}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(article.publishedAt)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{calculateReadTime(article.content)} min de leitura</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{article.views} visualizações</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {article.likes}
                </Button>
                
                <ShareButton 
                  title={article.title}
                  url={articleUrl}
                  description={article.excerpt}
                />
                
                <FavoriteButton 
                  articleId={article.id}
                  articleTitle={article.title}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Imagem de capa */}
          {article.coverImage && (
            <div className="mb-8">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-64 sm:h-80 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Conteúdo do artigo */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {article.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                    {paragraph.replace('## ', '')}
                  </h2>
                )
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
                    {paragraph.replace('### ', '')}
                  </h3>
                )
              }
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n')
                return (
                  <ul key={index} className="list-disc pl-6 space-y-1 mb-4">
                    {items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item.replace('- ', '')}</li>
                    ))}
                  </ul>
                )
              }
              return (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              )
            })}
          </div>
        </article>

        <Separator className="my-8" />

        {/* Seção sobre o autor */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-xl font-bold">Sobre o autor</h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback>
                  {author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">{author.name}</h4>
                <p className="text-muted-foreground mb-3">{author.bio}</p>
                <Badge variant="secondary">{author.role}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção de comentários */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-bold">
              Comentários ({comments.length})
            </h3>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Formulário para novo comentário */}
            {currentUser ? (
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>
                      {currentUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Escreva seu comentário..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={!newComment.trim()}>
                    Publicar comentário
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 bg-muted/20 rounded-lg">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-3">
                  Faça login para comentar neste artigo
                </p>
                <Button>Fazer login</Button>
              </div>
            )}

            <Separator />

            {/* Lista de comentários */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">
                  Seja o primeiro a comentar!
                </p>
              ) : (
                comments.map((comment) => {
                  const commentAuthor = getUserById(comment.userId)
                  if (!commentAuthor) return null

                  return (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={commentAuthor.avatar} alt={commentAuthor.name} />
                        <AvatarFallback>
                          {commentAuthor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{commentAuthor.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}