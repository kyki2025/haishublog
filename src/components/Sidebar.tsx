/**
 * Sidebar com categorias, artigos populares e tags
 * Componente responsivo que se adapta a diferentes tamanhos de tela
 */
import { Link } from 'react-router'
import { TrendingUp, Tag, User, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useBlogStore } from '@/lib/store'
import { mockUsers } from '@/lib/mockData'

export default function Sidebar() {
  const { articles, setSelectedCategory, selectedCategory } = useBlogStore()

  /**
   * Obter categorias únicas dos artigos
   */
  const categories = Array.from(new Set(articles.map(article => article.category)))

  /**
   * Obter artigos mais populares (por visualizações)
   */
  const popularArticles = [...articles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)

  /**
   * Obter todas as tags únicas
   */
  const allTags = Array.from(
    new Set(articles.flatMap(article => article.tags))
  ).slice(0, 15)

  /**
   * Formatar data para exibição
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short'
    })
  }

  /**
   * Obter autor por ID
   */
  const getAuthor = (authorId: string) => {
    return mockUsers.find(user => user.id === authorId)
  }

  return (
    <div className="space-y-6">
      {/* Categorias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="h-5 w-5" />
            <span>Categorias</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              selectedCategory === null 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            Todas as categorias
          </button>
          {categories.map((category) => {
            const count = articles.filter(article => article.category === category).length
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                  selectedCategory === category 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <span>{category}</span>
                <Badge variant="secondary" className="ml-2">
                  {count}
                </Badge>
              </button>
            )
          })}
        </CardContent>
      </Card>

      {/* Artigos Populares */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Mais Lidos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {popularArticles.map((article, index) => {
            const author = getAuthor(article.authorId)
            return (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="block group"
              >
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                      {author && (
                        <div className="flex items-center space-x-1">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={author.avatar} alt={author.name} />
                            <AvatarFallback className="text-xs">
                              {author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span>{author.name}</span>
                        </div>
                      )}
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {article.views} visualizações
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </CardContent>
      </Card>

      {/* Tags Populares */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="h-5 w-5" />
            <span>Tags Populares</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const count = articles.filter(article => 
                article.tags.includes(tag)
              ).length
              return (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {tag} ({count})
                </Badge>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Newsletter */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle>📧 Newsletter</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Receba as últimas novidades sobre Libras e educação inclusiva diretamente no seu email.
          </p>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Seu email"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            />
            <button className="w-full bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Inscrever-se
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
