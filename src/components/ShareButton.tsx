/**
 * 分享按钮组件
 * 支持复制链接和社交媒体分享
 */
import { useState } from 'react'
import { Share2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface ShareButtonProps {
  title: string
  url: string
  description?: string
}

export default function ShareButton({ title, url, description }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  /**
   * 复制链接到剪贴板
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('链接已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('复制失败，请手动复制链接')
    }
  }

  /**
   * 分享到微博
   */
  const shareToWeibo = () => {
    const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&pic=&appkey=`
    window.open(weiboUrl, '_blank', 'width=600,height=400')
  }

  /**
   * 分享到QQ空间
   */
  const shareToQzone = () => {
    const qzoneUrl = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&desc=${encodeURIComponent(description || '')}&summary=${encodeURIComponent(description || '')}&site=海叔的Blog`
    window.open(qzoneUrl, '_blank', 'width=600,height=400')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          分享
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={copyToClipboard}>
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? '已复制' : '复制链接'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToWeibo}>
          <span className="h-4 w-4 mr-2">🐦</span>
          分享到微博
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToQzone}>
          <span className="h-4 w-4 mr-2">🌐</span>
          分享到QQ空间
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}