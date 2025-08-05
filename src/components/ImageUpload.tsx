/**
 * 图片上传组件
 * 支持拖拽上传和点击选择文件
 */
import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void
  maxSize?: number // MB
  accept?: string
  className?: string
}

export default function ImageUpload({ 
  onImageUploaded, 
  maxSize = 5, 
  accept = "image/*",
  className = ""
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * 处理文件上传
   */
  const handleFileUpload = async (file: File) => {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`图片大小不能超过 ${maxSize}MB`)
      return
    }

    setIsUploading(true)

    try {
      // 将图片转换为 Base64 或上传到服务器
      const imageUrl = await convertToBase64(file)
      onImageUploaded(imageUrl)
      toast.success('图片上传成功')
    } catch (error) {
      console.error('图片上传失败:', error)
      toast.error('图片上传失败')
    } finally {
      setIsUploading(false)
    }
  }

  /**
   * 将文件转换为 Base64
   */
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * 处理拖拽事件
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  /**
   * 处理文件选择
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  /**
   * 打开文件选择对话框
   */
  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={className}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center space-y-2">
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">上传中...</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">点击上传或拖拽图片到此处</p>
                <p className="text-xs text-muted-foreground mt-1">
                  支持 JPG、PNG、GIF 格式，最大 {maxSize}MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 图片预览组件
 */
interface ImagePreviewProps {
  src: string
  alt?: string
  onRemove?: () => void
  className?: string
}

export function ImagePreview({ src, alt = "预览图片", onRemove, className = "" }: ImagePreviewProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      <img
        src={src}
        alt={alt}
        className="max-w-full h-auto rounded-lg border"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
      {onRemove && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

/**
 * 内联图片插入组件
 */
interface InlineImageInsertProps {
  onInsert: (imageUrl: string, alt?: string) => void
}

export function InlineImageInsert({ onInsert }: InlineImageInsertProps) {
  const [showUpload, setShowUpload] = useState(false)
  const [altText, setAltText] = useState('')

  const handleImageUploaded = (imageUrl: string) => {
    onInsert(imageUrl, altText || '图片')
    setShowUpload(false)
    setAltText('')
  }

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={() => setShowUpload(!showUpload)}
        className="w-full"
      >
        <ImageIcon className="h-4 w-4 mr-2" />
        插入图片
      </Button>

      {showUpload && (
        <div className="space-y-4 p-4 border rounded-lg">
          <div>
            <label className="text-sm font-medium">图片描述（可选）</label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="输入图片描述..."
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>
          
          <ImageUpload
            onImageUploaded={handleImageUploaded}
            maxSize={10}
          />
        </div>
      )}
    </div>
  )
}