/**
 * 收藏按钮组件
 * 允许用户收藏和取消收藏文章
 */
import { useState, useEffect } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBlogStore } from '@/lib/store'
import { toast } from 'sonner'

interface FavoriteButtonProps {
  articleId: string
  articleTitle: string
}

export default function FavoriteButton({ articleId, articleTitle }: FavoriteButtonProps) {
  const { currentUser, toggleFavorite, isFavorite } = useBlogStore()
  
  const isArticleFavorited = isFavorite(articleId)

  /**
   * 切换收藏状态
   */
  const handleToggleFavorite = () => {
    if (!currentUser) {
      toast.error('请先登录后再收藏文章')
      return
    }

    toggleFavorite(articleId)
    
    if (isArticleFavorited) {
      toast.success('已取消收藏')
    } else {
      toast.success('已添加到收藏')
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggleFavorite}
      disabled={!currentUser}
    >
      {isArticleFavorited ? (
        <>
          <BookmarkCheck className="h-4 w-4 mr-2 fill-current" />
          已收藏
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4 mr-2" />
          收藏
        </>
      )}
    </Button>
  )
}