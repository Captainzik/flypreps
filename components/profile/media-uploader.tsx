'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'

export type UploadedMediaResult = {
  kind: 'image' | 'video'
  url: string
  publicId: string
  bytes: number
  format: string
  width: number | null
  height: number | null
  duration: number | null
}

type UploadApiResponse = {
  success: boolean
  message?: string
  kind?: 'image' | 'video'
  url?: string
  publicId?: string
  bytes?: number
  format?: string
  width?: number | null
  height?: number | null
  duration?: number | null
}

type MediaUploaderProps = {
  value?: string
  label?: string
  disabled?: boolean
  onUploaded: (result: UploadedMediaResult) => void
}

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const ALLOWED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo',
  'video/x-matroska',
])

function getMediaKindAndLimit(type: string) {
  if (ALLOWED_IMAGE_TYPES.has(type)) {
    return { kind: 'image' as const, maxBytes: MAX_IMAGE_SIZE_BYTES }
  }
  if (ALLOWED_VIDEO_TYPES.has(type)) {
    return { kind: 'video' as const, maxBytes: MAX_VIDEO_SIZE_BYTES }
  }
  return null
}

function bytesToMb(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(2)
}

export default function MediaUploader({
  value,
  label = 'Upload image or video',
  disabled,
  onUploaded,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>(value || '')
  const [previewKind, setPreviewKind] = useState<'image' | 'video' | null>(null)

  async function handleFile(file: File) {
    const meta = getMediaKindAndLimit(file.type)

    if (!meta) {
      toast.error('Unsupported file type')
      return
    }

    if (file.size > meta.maxBytes) {
      toast.error(
        meta.kind === 'image'
          ? 'Image exceeds 10MB limit'
          : 'Video exceeds 100MB limit',
      )
      return
    }

    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)
    setPreviewKind(meta.kind)

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      const data = (await res.json()) as UploadApiResponse

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Upload failed')
      }

      if (
        !data.kind ||
        !data.url ||
        !data.publicId ||
        typeof data.bytes !== 'number' ||
        !data.format
      ) {
        throw new Error('Upload response incomplete')
      }

      const result: UploadedMediaResult = {
        kind: data.kind,
        url: data.url,
        publicId: data.publicId,
        bytes: data.bytes,
        format: data.format,
        width: data.width ?? null,
        height: data.height ?? null,
        duration: data.duration ?? null,
      }

      onUploaded(result)

      setPreviewUrl(result.url)
      setPreviewKind(result.kind)

      toast.success(
        `${result.kind === 'image' ? 'Image' : 'Video'} uploaded (${bytesToMb(result.bytes)} MB)`,
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className='space-y-3'>
      <label className='block text-sm font-medium text-slate-700'>
        {label}
      </label>

      <input
        ref={inputRef}
        type='file'
        accept='image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska'
        disabled={disabled || uploading}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          void handleFile(file)
          e.currentTarget.value = ''
        }}
        className='block w-full rounded border p-2 text-sm'
      />

      <p className='text-xs text-slate-500'>
        Images up to 10MB • Videos up to 100MB
      </p>

      {uploading ? (
        <p className='text-xs text-slate-500'>Uploading...</p>
      ) : null}

      {previewUrl ? (
        <div className='rounded-md border border-slate-200 p-2'>
          {previewKind === 'video' ? (
            <video
              src={previewUrl}
              controls
              className='max-h-64 w-full rounded object-contain'
            />
          ) : (
            <Image
              src={previewUrl}
              alt='Uploaded preview'
              width={256}
              height={256}
              className='max-h-64 w-full rounded object-contain'
            />
          )}
        </div>
      ) : null}
    </div>
  )
}
