import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { cloudinary } from '@/lib/cloudinary'

export const runtime = 'nodejs'

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024 // 100MB

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

function getFileKindAndLimit(mimeType: string) {
  if (ALLOWED_IMAGE_TYPES.has(mimeType)) {
    return { kind: 'image' as const, maxSize: MAX_IMAGE_SIZE_BYTES }
  }
  if (ALLOWED_VIDEO_TYPES.has(mimeType)) {
    return { kind: 'video' as const, maxSize: MAX_VIDEO_SIZE_BYTES }
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      )
    }

    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 },
      )
    }

    const meta = getFileKindAndLimit(file.type)
    if (!meta) {
      return NextResponse.json(
        { success: false, message: 'Unsupported file type' },
        { status: 400 },
      )
    }

    if (file.size > meta.maxSize) {
      return NextResponse.json(
        {
          success: false,
          message:
            meta.kind === 'image'
              ? 'Image too large (max 10MB)'
              : 'Video too large (max 100MB)',
        },
        { status: 400 },
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`

    const folder =
      meta.kind === 'image'
        ? 'flyprep/uploads/images'
        : 'flyprep/uploads/videos'

    const uploaded = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: meta.kind,
      public_id: `${meta.kind}_${session.user.id}_${Date.now()}`,
      overwrite: true,
      invalidate: true,
    })

    return NextResponse.json({
      success: true,
      kind: meta.kind,
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      bytes: uploaded.bytes,
      format: uploaded.format,
      width: uploaded.width ?? null,
      height: uploaded.height ?? null,
      duration: uploaded.duration ?? null,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
