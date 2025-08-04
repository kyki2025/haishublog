/**
 * API client para integração com WordPress REST API
 * Converte dados do WordPress para o formato do blog de Libras
 */

const WP_BASE_URL = 'https://seusite.com/wp-json/wp/v2'

export interface WordPressPost {
  id: number
  title: { rendered: string }
  content: { rendered: string }
  excerpt: { rendered: string }
  featured_media: number
  author: number
  categories: number[]
  tags: number[]
  date: string
  modified: string
  slug: string
  _embedded?: {
    author: Array<{
      id: number
      name: string
      avatar_urls: { [key: string]: string }
      description: string
    }>
    'wp:featuredmedia': Array<{
      source_url: string
      alt_text: string
    }>
    'wp:term': Array<Array<{
      id: number
      name: string
      slug: string
    }>>
  }
}

export interface WordPressUser {
  id: number
  name: string
  description: string
  avatar_urls: { [key: string]: string }
  meta: any
}

export interface WordPressComment {
  id: number
  post: number
  author: number
  author_name: string
  author_avatar_urls: { [key: string]: string }
  content: { rendered: string }
  date: string
  parent: number
}

/**
 * Buscar artigos do WordPress
 */
export async function fetchWordPressArticles(): Promise<Article[]> {
  try {
    const response = await fetch(`${WP_BASE_URL}/posts?_embed&per_page=50&status=publish`)
    const posts: WordPressPost[] = await response.json()
    
    return posts.map(convertWordPressPostToArticle)
  } catch (error) {
    console.error('Erro ao buscar artigos do WordPress:', error)
    return []
  }
}

/**
 * Buscar artigo específico por slug
 */
export async function fetchWordPressArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const response = await fetch(`${WP_BASE_URL}/posts?slug=${slug}&_embed`)
    const posts: WordPressPost[] = await response.json()
    
    if (posts.length === 0) return null
    
    return convertWordPressPostToArticle(posts[0])
  } catch (error) {
    console.error('Erro ao buscar artigo do WordPress:', error)
    return null
  }
}

/**
 * Buscar usuários do WordPress
 */
export async function fetchWordPressUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${WP_BASE_URL}/users`)
    const users: WordPressUser[] = await response.json()
    
    return users.map(convertWordPressUserToUser)
  } catch (error) {
    console.error('Erro ao buscar usuários do WordPress:', error)
    return []
  }
}

/**
 * Buscar comentários do WordPress
 */
export async function fetchWordPressComments(postId?: number): Promise<Comment[]> {
  try {
    const url = postId 
      ? `${WP_BASE_URL}/comments?post=${postId}&per_page=100`
      : `${WP_BASE_URL}/comments?per_page=100`
    
    const response = await fetch(url)
    const comments: WordPressComment[] = await response.json()
    
    return comments.map(convertWordPressCommentToComment)
  } catch (error) {
    console.error('Erro ao buscar comentários do WordPress:', error)
    return []
  }
}

/**
 * Adicionar novo comentário
 */
export async function addWordPressComment(articleId: string, content: string, authorName: string, authorEmail: string): Promise<Comment | null> {
  try {
    const response = await fetch(`${WP_BASE_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post: parseInt(articleId),
        content,
        author_name: authorName,
        author_email: authorEmail
      })
    })
    
    const comment: WordPressComment = await response.json()
    return convertWordPressCommentToComment(comment)
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error)
    return null
  }
}

/**
 * Converter post do WordPress para Article
 */
function convertWordPressPostToArticle(post: WordPressPost): Article {
  const author = post._embedded?.author?.[0]
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0]
  const categories = post._embedded?.['wp:term']?.[0] || []
  const tags = post._embedded?.['wp:term']?.[1] || []
  
  return {
    id: post.id.toString(),
    title: post.title.rendered,
    slug: post.slug,
    content: post.content.rendered,
    excerpt: post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 200),
    coverImage: featuredMedia?.source_url,
    authorId: post.author.toString(),
    tags: tags.map(tag => tag.name),
    category: categories[0]?.name || 'Geral',
    publishedAt: post.date,
    updatedAt: post.modified,
    likes: 0, // Implementar com meta fields
    views: 0, // Implementar com meta fields
    featured: false, // Implementar com meta fields
    status: 'published',
    readTime: calculateReadTime(post.content.rendered)
  }
}

/**
 * Converter usuário do WordPress para User
 */
function convertWordPressUserToUser(user: WordPressUser): User {
  return {
    id: user.id.toString(),
    name: user.name,
    email: '', // WordPress não expõe email via API por segurança
    avatar: user.avatar_urls['96'] || user.avatar_urls['48'],
    bio: user.description,
    role: 'author', // Determinar baseado em roles do WP
    createdAt: new Date().toISOString(), // WP não expõe data de criação
    isVerified: true
  }
}

/**
 * Converter comentário do WordPress para Comment
 */
function convertWordPressCommentToComment(comment: WordPressComment): Comment {
  return {
    id: comment.id.toString(),
    articleId: comment.post.toString(),
    userId: comment.author.toString(),
    content: comment.content.rendered.replace(/<[^>]*>/g, ''),
    createdAt: comment.date,
    likes: 0,
    parentId: comment.parent ? comment.parent.toString() : undefined
  }
}

/**
 * Calcular tempo de leitura
 */
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.replace(/<[^>]*>/g, '').split(' ').length
  return Math.ceil(wordCount / wordsPerMinute)
}

// Importar tipos do store
import { Article, User, Comment } from './store'
