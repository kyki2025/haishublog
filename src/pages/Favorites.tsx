/**
 * Página de artigos favoritos do usuário
 * Exibe lista de artigos salvos pelo usuário logado
 */
import { useMemo } from 'react'
import { BookmarkCheck, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Layout from '@/components/Layout'
import ArticleCard from '@/components/ArticleCard'
import { useBlogStore } from '@/lib/store'
import { mockUsers } from '@/lib/mockData'
import { Link } from 'react-router'

export default function Favorites() {
  const { currentUser, articles, favorites } = useBlogStore()

  /**
   * Filtrar artigos favoritos
   */
  const favoriteArticles = useMemo(() => {
    return articles.filter(article => favorites.includes(article.id))
  }, [articles, favorites])

  /**
   * Obter autor por ID
   */
  const getAuthor = (authorId: string) => {
    return mockUsers.find(user => user.id === authorId)!
  }

  // Verificar se usuário está logado
  if (!currentUser) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <BookmarkCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Faça login para ver seus favoritos</h1>
          <p className="text-muted-foreground mb-4">
            Salve artigos interessantes para ler mais tarde.
          </p>
          <Button>Fazer login</Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <BookmarkCheck className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Meus Favoritos</h1>
          </div>
          <p className="text-muted-foreground">
            {favoriteArticles.length > 0 
              ? `Você tem ${favoriteArticles.length} artigo(s) favorito(s)`
              : 'Você ainda não favoritou nenhum artigo'
            }
          </p>
        </div>

        {/* Conteúdo */}
        {favoriteArticles.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum artigo favorito</h3>
            <p className="text-muted-foreground mb-6">
              Explore nossos artigos e favorite os que mais interessar para você.
            </p>
            <Button asChild>
              <Link to="/">Explorar artigos</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                author={getAuthor(article.authorId)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}