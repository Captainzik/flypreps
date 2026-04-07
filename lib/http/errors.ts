export class AppError extends Error {
  readonly statusCode: number
  readonly code: string
  readonly details?: unknown

  constructor(
    message: string,
    options?: {
      statusCode?: number
      code?: string
      details?: unknown
    },
  ) {
    super(message)
    this.name = 'AppError'
    this.statusCode = options?.statusCode ?? 400
    this.code = options?.code ?? 'APP_ERROR'
    this.details = options?.details
  }
}

export function toErrorMessage(error: unknown, fallback = 'Unexpected error') {
  if (error instanceof Error) return error.message
  return fallback
}
