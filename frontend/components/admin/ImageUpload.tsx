"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value: File | null
  onChange: (file: File | null) => void
  existingImage?: string
}

export default function ImageUpload({ value, onChange, existingImage }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingImage || null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [value])

  useEffect(() => {
    if (!value) setPreview(existingImage || null)
  }, [existingImage, value])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      onChange(file)
    }
  }, [onChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onChange(file)
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {preview ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200">
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-2 rounded-lg bg-white/90 hover:bg-white text-gray-700 transition-all"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 rounded-lg bg-white/90 hover:bg-white text-red-600 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer',
            dragging
              ? 'border-brand-400 bg-brand-50'
              : 'border-gray-200 bg-gray-50 hover:border-brand-300 hover:bg-brand-50/50'
          )}
        >
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-brand-50 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-brand-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">
              Drop an image here or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleChange}
        className="hidden"
      />
    </motion.div>
  )
}
