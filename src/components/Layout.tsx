/**
 * Layout principal da aplicação
 * Inclui header, navegação, sidebar, sistema de temas e autenticação
 */
import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { 
  Search, 
  Menu, 
  Sun, 
  Moon, 
  User, 
  BookOpen, 
  Home, 
  Tag, 
  Users,
  BookmarkCheck,
  Settings,
  LogOut,
  Shield
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import AuthModal from '@/components/AuthModal'
import NotificationCenter from '@/components/NotificationCenter'
import { useBlogStore } from '@/lib/store'
import { Toaster } from 'sonner'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const { searchQuery, setSearchQuery, currentUser, logout } = useBlogStore()
  const [showAuthModal, setShowAuthModal] = useState(false)

  /**
   * Verifica se a rota está ativa
   */
  const isActive = (path: string) => location.pathname === path

  /**
   * Manipula o logout
   */
  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Toast Container */}
      <Toaster richColors position="top-right" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">海树的生活札记</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>首页</span>
              </Link>
              
              {currentUser && (
                <Link 
                  to="/favorites" 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/favorites') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <BookmarkCheck className="h-4 w-4" />
                  <span>收藏</span>
                </Link>
              )}

              {currentUser?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/admin') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索文章..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Notifications */}
              {currentUser && <NotificationCenter />}

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">切换主题</span>
              </Button>

              {/* User Menu */}
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                        <AvatarFallback>
                          {currentUser.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {currentUser.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {currentUser.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/favorites">
                        <BookmarkCheck className="mr-2 h-4 w-4" />
                        <span>收藏</span>
                      </Link>
                    </DropdownMenuItem>
                    {currentUser.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>管理面板</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>设置</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>退出</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setShowAuthModal(true)}>
                  <User className="h-4 w-4 mr-2" />
                  登录
                </Button>
              )}

              {/* Mobile Menu */}
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">菜单</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">海树的生活札记</span>
              </div>
              <p className="text-sm text-muted-foreground">
                分享茶文化、摄影、思考与日语学习的点点滴滴，记录生活中的美好瞬间。
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">导航</h3>
              <div className="space-y-2">
                <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground">
                  首页
                </Link>
                <Link to="/favorites" className="block text-sm text-muted-foreground hover:text-foreground">
                  收藏
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">分类</h3>
              <div className="space-y-2">
                <Link to="/?category=茶文化" className="block text-sm text-muted-foreground hover:text-foreground">
                  茶文化
                </Link>
                <Link to="/?category=摄影" className="block text-sm text-muted-foreground hover:text-foreground">
                  摄影
                </Link>
                <Link to="/?category=思考" className="block text-sm text-muted-foreground hover:text-foreground">
                  思考
                </Link>
                <Link to="/?category=日语" className="block text-sm text-muted-foreground hover:text-foreground">
                  日语
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">联系方式</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  haishublog@example.com
                </p>
                <p className="text-sm text-muted-foreground">
                  微信：haishublog
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 海树的生活札记. 保留所有权利. 用 ❤️ 记录生活的美好时光.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  )
}