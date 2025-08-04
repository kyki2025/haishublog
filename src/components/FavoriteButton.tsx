/**
 * Botão para favoritar/desfavoritar artigos
 * Gerencia estado persistente de favoritos
 */
import { BookmarkPlus, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBlogStore } from '@/lib/store'
import { toast } from 'sonner'

interface FavoriteButtonProps {
  articleId: string
  articleTitle: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  showText?: boolean
  className?: string
}

export default function FavoriteButton({ 
  articleId, 
  articleTitle,
  variant = 'outline',
  size = 'sm',
  showText = true,
  className = ''
}: FavoriteButtonProps) {
  const { currentUser, toggleFavorite, isFavorite } = useBlogStore()
  
  const isArticleFavorited = isFavorite(articleId)

  /**
   * Manipula o clique no botão de favoritar
   */
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault() // Evita navegação se estiver dentro de um link
    
    if (!currentUser) {
      toast.error('Faça login para favoritar artigos')
      return
    }

    toggleFavorite(articleId)
    
    if (isArticleFavorited) {
      toast.success('Artigo removido dos favoritos')
    } else {
      toast.success('Artigo adicionado aos favoritos!')
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      className={className}
      disabled={!currentUser}
    >
      {isArticleFavorited ? (
        <>
          <BookmarkCheck className="h-4 w-4 mr-2 fill-current" />
          {showText && 'Favoritado'}
        </>
      ) : (
        <>
          <BookmarkPlus className="h-4 w-4 mr-2" />
          {showText && 'Favoritar'}
        </>
      )}
    </Button>
  )
}