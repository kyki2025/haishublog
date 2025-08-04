/**
 * Botão de compartilhamento social com múltiplas plataformas
 * Inclui WhatsApp, Twitter, Facebook, LinkedIn e cópia de link
 */
import { useState } from 'react'
import { Share2, Copy, MessageCircle, Twitter, Facebook, Linkedin, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface ShareButtonProps {
  title: string
  url: string
  description?: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export default function ShareButton({ 
  title, 
  url, 
  description = '', 
  className = '',
  variant = 'outline',
  size = 'sm'
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  /**
   * Copia o link para a área de transferência
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copiado para a área de transferência!')
      
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      toast.error('Erro ao copiar link')
    }
  }

  /**
   * Abre o WhatsApp com o link compartilhado
   */
  const shareOnWhatsApp = () => {
    const text = `${title}\n\n${description}\n\n${url}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
  }

  /**
   * Abre o Twitter com o link compartilhado
   */
  const shareOnTwitter = () => {
    const text = `${title}\n\n${description}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, '_blank')
  }

  /**
   * Abre o Facebook com o link compartilhado
   */
  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(facebookUrl, '_blank')
  }

  /**
   * Abre o LinkedIn com o link compartilhado
   */
  const shareOnLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    window.open(linkedinUrl, '_blank')
  }

  /**
   * Usa a API nativa de compartilhamento se disponível
   */
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        })
      } catch (error) {
        // Usuário cancelou o compartilhamento
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {/* Compartilhamento nativo (mobile) */}
        {navigator.share && (
          <>
            <DropdownMenuItem onClick={handleNativeShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* WhatsApp */}
        <DropdownMenuItem onClick={shareOnWhatsApp}>
          <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
          WhatsApp
        </DropdownMenuItem>

        {/* Twitter */}
        <DropdownMenuItem onClick={shareOnTwitter}>
          <Twitter className="h-4 w-4 mr-2 text-blue-400" />
          Twitter
        </DropdownMenuItem>

        {/* Facebook */}
        <DropdownMenuItem onClick={shareOnFacebook}>
          <Facebook className="h-4 w-4 mr-2 text-blue-600" />
          Facebook
        </DropdownMenuItem>

        {/* LinkedIn */}
        <DropdownMenuItem onClick={shareOnLinkedIn}>
          <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
          LinkedIn
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