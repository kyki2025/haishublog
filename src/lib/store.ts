/**
 * Store global da aplicação usando Zustand
 * Gerencia estado de usuários, artigos, comentários e notificações
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockUsers, mockArticles, mockComments, mockNotifications } from './mockData'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  bio: string
  role: 'admin' | 'user'
  createdAt: string
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  author: User
  category: string
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  likes: number
  views: number
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  articleId: string
  author: User
  content: string
  createdAt: string
  likes: number
}

export interface Notification {
  id: string
  userId: string
  type: 'like' | 'comment' | 'follow' | 'article'
  title: string
  message: string
  read: boolean
  createdAt: string
  relatedId?: string
}

interface BlogState {
  // Users
  users: User[]
  currentUser: User | null
  
  // Articles
  articles: Article[]
  
  // Comments
  comments: Comment[]
  
  // Notifications
  notifications: Notification[]
  
  // Favorites
  favorites: string[]
  
  // Actions
  login: (email: string, password: string) => boolean
  logout: () => void
  register: (userData: Omit<User, 'id' | 'createdAt'>) => boolean
  
  // Article actions
  addArticle: (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'views'>) => void
  updateArticle: (id: string, updates: Partial<Article>) => void
  deleteArticle: (id: string) => void
  likeArticle: (id: string) => void
  incrementViews: (id: string) => void
  
  // Comment actions
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'likes'>) => void
  likeComment: (id: string) => void
  
  // Favorite actions
  toggleFavorite: (articleId: string) => void
  isFavorite: (articleId: string) => boolean
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markNotificationAsRead: (id: string) => void
  getUnreadNotifications: (userId: string) => Notification[]
}

export const useBlogStore = create<BlogState>()(
  persist(
    (set, get) => ({
      // Initial state
      users: mockUsers,
      currentUser: null,
      articles: mockArticles,
      comments: mockComments,
      notifications: mockNotifications,
      favorites: [],
      
      // Auth actions
      login: (email: string, password: string) => {
        // Mock validation - 支持不同用户的不同密码
        const user = get().users.find(u => u.email === email)
        let isValidPassword = false
        
        if (user) {
          // 管理员账户使用 password123
          if (user.email === 'haishublog@example.com' && password === 'password123') {
            isValidPassword = true
          }
          // 其他测试账户使用 123456
          else if (password === '123456') {
            isValidPassword = true
          }
        }
        
        if (user && isValidPassword) {
          set({ currentUser: user })
          return true
        }
        return false
      },
      
      logout: () => {
        set({ currentUser: null })
      },
      
      register: (userData) => {
        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }
        
        set(state => ({
          users: [...state.users, newUser],
          currentUser: newUser
        }))
        
        return true
      },
      
      // Article actions
      addArticle: (articleData) => {
        const newArticle: Article = {
          ...articleData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likes: 0,
          views: 0
        }
        
        set(state => ({
          articles: [newArticle, ...state.articles]
        }))
      },
      
      updateArticle: (id, updates) => {
        set(state => ({
          articles: state.articles.map(article =>
            article.id === id
              ? { ...article, ...updates, updatedAt: new Date().toISOString() }
              : article
          )
        }))
      },
      
      deleteArticle: (id) => {
        set(state => ({
          articles: state.articles.filter(article => article.id !== id),
          comments: state.comments.filter(comment => comment.articleId !== id)
        }))
      },
      
      likeArticle: (id) => {
        set(state => ({
          articles: state.articles.map(article =>
            article.id === id
              ? { ...article, likes: article.likes + 1 }
              : article
          )
        }))
      },
      
      incrementViews: (id) => {
        set(state => ({
          articles: state.articles.map(article =>
            article.id === id
              ? { ...article, views: article.views + 1 }
              : article
          )
        }))
      },
      
      // Comment actions
      addComment: (commentData) => {
        const newComment: Comment = {
          ...commentData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          likes: 0
        }
        
        set(state => ({
          comments: [...state.comments, newComment]
        }))
      },
      
      likeComment: (id) => {
        set(state => ({
          comments: state.comments.map(comment =>
            comment.id === id
              ? { ...comment, likes: comment.likes + 1 }
              : comment
          )
        }))
      },
      
      // Favorite actions
      toggleFavorite: (articleId) => {
        set(state => {
          const isFavorited = state.favorites.includes(articleId)
          return {
            favorites: isFavorited
              ? state.favorites.filter(id => id !== articleId)
              : [...state.favorites, articleId]
          }
        })
      },
      
      isFavorite: (articleId) => {
        const state = get()
        return state.favorites.includes(articleId)
      },
      
      // Notification actions
      addNotification: (notificationData) => {
        const newNotification: Notification = {
          ...notificationData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }
        
        set(state => ({
          notifications: [newNotification, ...state.notifications]
        }))
      },
      
      markNotificationAsRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(notification =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          )
        }))
      },
      
      getUnreadNotifications: (userId) => {
        const state = get()
        return state.notifications.filter(
          notification => notification.userId === userId && !notification.read
        )
      }
    }),
    {
      name: 'blog-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        articles: state.articles,
        comments: state.comments,
        notifications: state.notifications,
        favorites: state.favorites
      })
    }
  )
)