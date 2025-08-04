/**
 * Componente de compartilhamento social
 * Permite compartilhar artigos em diferentes plataformas sociais
 */
import { useState } from 'react'
import { Share2, Copy, Check, Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Article } from '@/lib/store'

interface SocialShareProps {
  article: Article
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export default function SocialShare({ article, variant = 'outline', size = 'sm' }: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  
  // URL do artigo
  const articleUrl = `${window.location.origin}/#/article/${article.slug}`
  
  // Texto para compartilhamento
  const shareText = `${article.title} - ${article.excerpt}`
  
  /**
   * Copia o link para a área de transferência
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl)
      setCopied(true)
      toast.success('Link copiado para a área de transferência!')
      
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Erro ao copiar link')
    }
  }

  /**
   * Compartilha no Facebook
   */
  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
  }

  /**
   * Compartilha no Twitter
   */
  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(articleUrl)}&hashtags=${encodeURIComponent('Libras,EducaçãoInclusiva')}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
  }

  /**
   * Compartilha no LinkedIn
   */
  const shareOnLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`
    window.open(linkedInUrl, '_blank', 'width=600,height=400')
  }

  /**
   * Compartilha no WhatsApp
   */
  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${articleUrl}`)}`
    window.open(whatsappUrl, '_blank')
  }

  /**
   * Usa a API nativa de compartilhamento (se disponível)
   */
  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: articleUrl
        })
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Erro ao compartilhar')
        }
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        {/* Compartilhamento nativo (se disponível) */}
        {navigator.share && (
          <>
            <DropdownMenuItem onClick={shareNative}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Redes sociais */}
        <DropdownMenuItem onClick={shareOnFacebook}>
          <Facebook className="h-4 w-4 mr-2 text-blue-600" />
          Facebook
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareOnTwitter}>
          <Twitter className="h-4 w-4 mr-2 text-sky-500" />
          Twitter
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareOnLinkedIn}>
          <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
          LinkedIn
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareOnWhatsApp}>
          <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
          WhatsApp
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Copiar link */}
        <DropdownMenuItem onClick={copyToClipboard}>
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? 'Copiado!' : 'Copiar link'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}