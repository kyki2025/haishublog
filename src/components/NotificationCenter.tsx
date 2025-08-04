/**
 * Centro de notificações com dropdown e gerenciamento de estado
 * Exibe notificações não lidas e permite marcar como lidas
 */
import { useState, useEffect } from 'react'
import { Bell, Check, X, MessageCircle, Heart, UserPlus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useBlogStore, Notification } from '@/lib/store'
import { Link } from 'react-router'

export default function NotificationCenter() {
  const { 
    currentUser, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    getUnreadNotifications,
    users 
  } = useBlogStore()
  
  const [isOpen, setIsOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (currentUser) {
      const unread = getUnreadNotifications(currentUser.id)
      setUnreadNotifications(unread)
    }
  }, [currentUser, notifications, getUnreadNotifications])

  /**
   * Obtém o ícone baseado no tipo de notificação
   */
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />
      case 'article_published':
        return <FileText className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  /**
   * Formata a data da notificação
   */
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return 'Agora mesmo'
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d atrás`
    }
  }

  /**
   * Obtém informações do usuário que gerou a notificação
   */
  const getSourceUser = (sourceUserId?: string) => {
    if (!sourceUserId) return null
    return users.find(user => user.id === sourceUserId)
  }

  /**
   * Marca uma notificação como lida e navega para a URL de ação
   */
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.id)
    }
    setIsOpen(false)
  }

  /**
   * Marca todas as notificações como lidas
   */
  const handleMarkAllAsRead = () => {
    if (currentUser) {
      markAllNotificationsAsRead(currentUser.id)
    }
  }

  if (!currentUser) {
    return null
  }

  const userNotifications = notifications
    .filter(n => n.userId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20) // Limitar a 20 notificações

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadNotifications.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
            </Badge>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notificações</h3>
            {unreadNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-auto p-1 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <ScrollArea className="h-96">
          {userNotifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="space-y-1">
              {userNotifications.map((notification) => {
                const sourceUser = getSourceUser(notification.sourceUserId)
                
                return (
                  <DropdownMenuItem key={notification.id} className="p-0">
                    {notification.actionUrl ? (
                      <Link
                        to={notification.actionUrl}
                        className="flex items-start space-x-3 p-3 w-full hover:bg-muted/50 transition-colors"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {sourceUser ? (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={sourceUser.avatar} />
                              <AvatarFallback className="text-xs">
                                {sourceUser.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatNotificationDate(notification.createdAt)}
                              </p>
                            </div>
                            
                            {!notification.isRead && (
                              <div className="flex-shrink-0 ml-2">
                                <div className="h-2 w-2 bg-primary rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div 
                        className="flex items-start space-x-3 p-3 w-full hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatNotificationDate(notification.createdAt)}
                              </p>
                            </div>
                            
                            {!notification.isRead && (
                              <div className="flex-shrink-0 ml-2">
                                <div className="h-2 w-2 bg-primary rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </DropdownMenuItem>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {userNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full justify-center">
                Ver todas as notificações
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}