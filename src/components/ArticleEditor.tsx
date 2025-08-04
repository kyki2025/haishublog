/**
 * 完整功能的文章编辑器
 * 支持创建和编辑文章，实时预览
 */
import { useState, useEffect } from 'react'
import { X, Save, Eye, Upload, Tag, Calendar, User } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { useBlogStore, Article } from '@/lib/store'

interface ArticleEditorProps {
  articleId?: string | null
  onClose: () => void
}

export default function ArticleEditor({ articleId, onClose }: ArticleEditorProps) {
  const { articles, addArticle, updateArticle, currentUser } = useBlogStore()
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    category: '',
    tags: [] as string[],
    featured: false,
    status: 'draft' as Article['status']
  })
  
  const [newTag, setNewTag] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 加载文章进行编辑
  useEffect(() => {
    if (articleId) {
      const article = articles.find(a => a.id === articleId)
      if (article) {
        setFormData({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          coverImage: article.coverImage || '',
          category: article.category,
          tags: article.tags,
          featured: article.featured,
          status: article.status
        })
      }
    }
  }, [articleId, articles])

  /**
   * 根据标题自动生成链接
   */
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  /**
   * 处理标题变化并自动生成链接
   */
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: !articleId ? generateSlug(title) : prev.slug // 只有新文章才自动生成链接
    }))
  }

  /**
   * 添加新标签
   */
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  /**
   * 移除标签
   */
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  /**
   * 保存文章
   */
  const handleSave = async (status?: Article['status']) => {
    if (!currentUser) {
      toast.error('您需要登录才能保存文章')
      return
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('标题和内容为必填项')
      return
    }

    setIsSaving(true)

    try {
      const articleData: Article = {
        id: articleId || Date.now().toString(),
        title: formData.title.trim(),
        slug: formData.slug.trim() || generateSlug(formData.title),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        coverImage: formData.coverImage.trim() || undefined,
        authorId: currentUser.id,
        category: formData.category || '生活',
        tags: formData.tags,
        featured: formData.featured,
        status: status || formData.status,
        publishedAt: articleId ? 
          articles.find(a => a.id === articleId)?.publishedAt || new Date().toISOString() :
          new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: articleId ? articles.find(a => a.id === articleId)?.likes || 0 : 0,
        views: articleId ? articles.find(a => a.id === articleId)?.views || 0 : 0
      }

      if (articleId) {
        updateArticle(articleId, articleData)
        toast.success('文章更新成功！')
      } else {
        addArticle(articleData)
        toast.success('文章创建成功！')
      }

      onClose()
    } catch (error) {
      toast.error('保存文章时出错')
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Markdown内容预览
   */
  const renderPreview = () => {
    return formData.content.split('\n\n').map((paragraph, index) => {
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
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>
              {articleId ? '编辑文章' : '新建文章'}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handleSave('draft')}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                保存草稿
              </Button>
              <Button
                onClick={() => handleSave('published')}
                disabled={isSaving}
              >
                发布
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="edit" className="h-full flex flex-col">
            <TabsList className="flex-shrink-0">
              <TabsTrigger value="edit">编辑</TabsTrigger>
              <TabsTrigger value="preview">预览</TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="flex-1 overflow-auto space-y-6 pr-2">
              {/* 基本信息 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {/* 标题 */}
                  <div className="space-y-2">
                    <Label htmlFor="title">标题 *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="输入文章标题..."
                    />
                  </div>

                  {/* 链接 */}
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL (链接)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="article-url"
                    />
                  </div>

                  {/* 摘要 */}
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">摘要</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="文章简要描述..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* 作者 */}
                  <div className="space-y-2">
                    <Label>作者</Label>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser?.avatar} />
                        <AvatarFallback>
                          {currentUser?.name.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{currentUser?.name}</span>
                    </div>
                  </div>

                  {/* 分类 */}
                  <div className="space-y-2">
                    <Label htmlFor="category">分类</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="茶文化">茶文化</SelectItem>
                        <SelectItem value="摄影">摄影</SelectItem>
                        <SelectItem value="思考">思考</SelectItem>
                        <SelectItem value="日语">日语</SelectItem>
                        <SelectItem value="生活">生活</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 状态 */}
                  <div className="space-y-2">
                    <Label htmlFor="status">状态</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: Article['status']) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">草稿</SelectItem>
                        <SelectItem value="published">已发布</SelectItem>
                        <SelectItem value="archived">已归档</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 推荐 */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="featured">推荐文章</Label>
                      <p className="text-sm text-muted-foreground">
                        将在推荐区域显示
                      </p>
                    </div>
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                    />
                  </div>
                </div>
              </div>

              {/* 封面图片 */}
              <div className="space-y-2">
                <Label htmlFor="coverImage">封面图片 (URL)</Label>
                <Input
                  id="coverImage"
                  value={formData.coverImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.coverImage && (
                  <div className="mt-2">
                    <img
                      src={formData.coverImage}
                      alt="封面预览"
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* 标签 */}
              <div className="space-y-2">
                <Label>标签</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="输入标签..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 内容 */}
              <div className="space-y-2">
                <Label htmlFor="content">内容 *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="使用 Markdown 格式编写文章内容...&#10;&#10;## 章节标题&#10;&#10;正文段落...&#10;&#10;### 小标题&#10;&#10;- 列表项&#10;- 另一个列表项"
                  rows={20}
                  className="font-mono"
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 overflow-auto">
              <div className="max-w-4xl mx-auto">
                {/* 预览头部 */}
                <div className="mb-8">
                  {formData.category && (
                    <Badge variant="secondary" className="mb-3">
                      {formData.category}
                    </Badge>
                  )}
                  
                  <h1 className="text-4xl font-bold leading-tight mb-4">
                    {formData.title || '文章标题'}
                  </h1>
                  
                  {formData.excerpt && (
                    <p className="text-xl text-muted-foreground mb-6">
                      {formData.excerpt}
                    </p>
                  )}

                  {/* 作者信息 */}
                  <div className="flex items-center space-x-4 mb-6">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={currentUser?.avatar} />
                      <AvatarFallback>
                        {currentUser?.name.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{currentUser?.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>刚刚</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 标签 */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* 封面图片 */}
                {formData.coverImage && (
                  <div className="mb-8">
                    <img
                      src={formData.coverImage}
                      alt={formData.title}
                      className="w-full h-64 sm:h-80 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* 内容 */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {formData.content ? renderPreview() : (
                    <p className="text-muted-foreground italic">
                      内容将在您输入时显示在这里...
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}