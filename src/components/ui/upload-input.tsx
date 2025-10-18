'use client'
import { useState, useRef } from 'react'
import { Input } from './input'
import { Button } from './button'
import { Spinner } from './spinner'
import { Upload } from 'lucide-react'

type UploadInputProps = {
  onUploadSuccess?: () => void
}

export function UploadInput({ onUploadSuccess }: UploadInputProps) {
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    setIsLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/files/upload/smallFiles', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        onUploadSuccess?.()
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleButtonClick = () => {
    const file = fileInputRef.current?.files?.[0]
    if (file) {
      handleFileUpload(file)
    } else {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="flex items-center gap-2 w-full max-w-md mx-auto">
      <Input
        ref={fileInputRef}
        type="file"
        disabled={isLoading}
        className="flex-1 min-w-0"
      />
      <Button
        onClick={handleButtonClick}
        disabled={isLoading}
        size="sm"
        className="shrink-0 px-3"
      >
        {isLoading ? <Spinner className="size-4" /> : <Upload className="size-4" />}
      </Button>
    </div>
  )
}