import Image from 'next/image'
import { isVideoUrl } from '@/lib/utils/media'

type Props = {
  url?: string
  alt: string
  className?: string
  sizes?: string
}

export default function MediaPreview({
  url,
  alt,
  className,
  sizes = '384px',
}: Props) {
  const src = (url ?? '').trim()
  if (!src) return null

  if (isVideoUrl(src)) {
    return (
      <video
        src={src}
        controls
        preload='metadata'
        className={className ?? 'h-full w-full object-cover'}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className ?? 'object-cover'}
      sizes={sizes}
    />
  )
}
