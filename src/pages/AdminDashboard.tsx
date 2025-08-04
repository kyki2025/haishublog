/**
 * 个人博客管理后台
 * 包含文章管理、统计数据和评论管理
 */
import { useState, useMemo } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  FileText, 
  MessageCircle,
  TrendingUp,
  Calendar,
  BarChart3,
  Settings,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Layout from '@/components/Layout'
import ArticleEditor from '@/components/ArticleEditor'
import { useBlogStore } from '@/lib/store'
import { Link } from 'react-router'

export default function AdminDashboard() {
  const { 
    articles, 
    users, 
    comments, 
    currentUser, 
    deleteArticle, 
    updateUserRole,
    banUser 
  } = useBlogStore()
  
  const [selectedTab, setSelectedTab] = useState('overview')
  const [showEditor, setShowEditor] = useState(false)
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null)

  // Verificar se o usuário é admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">访问受限</h1>
          <p className="text-muted-foreground mb-4">
            您需要管理员权限才能访问此页面。
          </p>
          <Button asChild>
            <Link to="/">返回首页</Link>
          </Button>
        </div>
      </Layout>
    )
  }

  /**
   * Estatísticas do dashboard
   */
  const stats = useMemo(() => {
    const totalViews = articles.reduce((sum, article) => sum + article.views, 0)
    const totalLikes = articles.reduce((sum, article) => sum + article.likes, 0)
    const publishedArticles = articles.filter(a => a.status === 'published').length
    const draftArticles = articles.filter(a => a.status === 'draft').length

    return {
      totalArticles: articles.length,
      publishedArticles,
      draftArticles,
      totalUsers: users.length,
      totalComments: comments.length,
      totalViews,
      totalLikes,
      avgViewsPerArticle: Math.round(totalViews / articles.length) || 0
    }
  }, [articles, users, comments])

  /**
   * Artigos mais populares
   */
  const popularArticles = useMemo(() => {
    return [...articles]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
  }, [articles])

  /**
   * Formatar data
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  /**
   * Obter autor por ID
   */
  const getAuthor = (authorId: string) => {
    return users.find(user => user.id === authorId)
  }

  /**
   * Deletar artigo
   */
  const handleDeleteArticle = (articleId: string) => {
    deleteArticle(articleId)
  }

  /**
   * 打开文章编辑器
   */
  const handleNewArticle = () => {
    setEditingArticleId(null)
    setShowEditor(true)
  }

  /**
   * 编辑文章
   */
  const handleEditArticle = (articleId: string) => {
    setEditingArticleId(articleId)
    setShowEditor(true)
  }

  /**
   * 关闭编辑器
   */
  const handleCloseEditor = () => {
    setShowEditor(false)
    setEditingArticleId(null)
  }

  /**
   * Atualizar role do usuário
   */
  const handleUpdateUserRole = (userId: string, newRole: 'admin' | 'author' | 'reader') => {
    updateUserRole(userId, newRole)
  }

  /**
   * Banir usuário
   */
  const handleBanUser = (userId: string) => {
    banUser(userId)
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">博客管理后台</h1>
          <p className="text-muted-foreground">
            管理文章、用户和查看博客统计数据
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="articles">文章管理</TabsTrigger>
            <TabsTrigger value="users">用户管理</TabsTrigger>
            <TabsTrigger value="comments">评论管理</TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">文章总数</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalArticles}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.publishedArticles} 已发布, {stats.draftArticles} 草稿
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">用户总数</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    注册用户
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总浏览量</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    平均每篇 {stats.avgViewsPerArticle} 次浏览
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">评论总数</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalComments}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalLikes} 个赞
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Artigos Populares */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>热门文章</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularArticles.map((article, index) => {
                    const author = getAuthor(article.authorId)
                    return (
                      <div key={article.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/article/${article.slug}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {article.title}
                          </Link>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span>{article.views} 浏览</span>
                            <span>{article.likes} 赞</span>
                            <span>作者 {author?.name}</span>
                          </div>
                        </div>
                        <Badge variant="secondary">{article.category}</Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Artigos */}
          <TabsContent value="articles">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>文章管理</CardTitle>
                  <Button onClick={handleNewArticle}>
                    <Plus className="h-4 w-4 mr-2" />
                    新建文章
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>标题</TableHead>
                      <TableHead>作者</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>浏览量</TableHead>
                      <TableHead>日期</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((article) => {
                      const author = getAuthor(article.authorId)
                      return (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium">
                            <Link 
                              to={`/article/${article.slug}`}
                              className="hover:text-primary transition-colors"
                            >
                              {article.title}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={author?.avatar} />
                                <AvatarFallback className="text-xs">
                                  {author?.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span>{author?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={article.status === 'published' ? 'default' : 'secondary'}
                            >
                              {article.status === 'published' ? '已发布' : '草稿'}
                            </Badge>
                          </TableCell>
                          <TableCell>{article.views}</TableCell>
                          <TableCell>{formatDate(article.publishedAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditArticle(article.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>删除文章</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      此操作无法撤销。文章将被永久删除。
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>取消</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteArticle(article.id)}
                                    >
                                      删除
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Usuários */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>用户管理</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>用户</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>角色</TableHead>
                      <TableHead>注册日期</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              {user.bio && (
                                <div className="text-sm text-muted-foreground">
                                  {user.bio}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleUpdateUserRole(user.id, value as any)}
                            disabled={user.id === currentUser.id}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="reader">读者</SelectItem>
                              <SelectItem value="author">作者</SelectItem>
                              <SelectItem value="admin">管理员</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          {user.id !== currentUser.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                封禁
                              </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>封禁用户</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    此操作将永久从系统中移除该用户。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleBanUser(user.id)}
                                  >
                                    封禁
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Comentários */}
          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <CardTitle>评论管理</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comments.map((comment) => {
                    const user = users.find(u => u.id === comment.userId)
                    const article = articles.find(a => a.id === comment.articleId)
                    
                    return (
                      <div key={comment.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user?.avatar} />
                              <AvatarFallback className="text-xs">
                                {user?.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium">{user?.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm mb-2">{comment.content}</p>
                              <div className="text-xs text-muted-foreground">
                                文章: <Link 
                                  to={`/article/${article?.slug}`}
                                  className="hover:text-primary"
                                >
                                  {article?.title}
                                </Link>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 文章编辑器 */}
        {showEditor && (
          <ArticleEditor
            articleId={editingArticleId}
            onClose={handleCloseEditor}
          />
        )}
      </div>
    </Layout>
  )
}
