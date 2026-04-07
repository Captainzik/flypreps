import { NextResponse } from 'next/server'
import { AppError, toErrorMessage } from './errors'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function fail(error: unknown, fallbackMessage = 'Request failed') {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        code: error.code,
        details: error.details ?? null,
      },
      { status: error.statusCode },
    )
  }

  return NextResponse.json(
    {
      success: false,
      message: toErrorMessage(error, fallbackMessage),
      code: 'UNEXPECTED_ERROR',
      details: null,
    },
    { status: 500 },
  )
}
