import crypto from 'node:crypto'
import type { H3Event } from 'h3'
import { prisma } from './prisma'

const SESSION_COOKIE_NAME = 'evakos_session'
const SESSION_SECRET = process.env.SESSION_SECRET || 'evakos-secret-salt-key-2026-secure'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

export function createSessionToken(userId: string): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000
  const data = `${userId}:${expiresAt}`
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex')
  return Buffer.from(`${data}:${signature}`).toString('base64url')
}

export function verifySessionToken(token: string): { userId: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    const [userId, expiresAtStr, signature] = decoded.split(':')
    if (!userId || !expiresAtStr || !signature) return null

    const expiresAt = parseInt(expiresAtStr, 10)
    if (isNaN(expiresAt) || Date.now() > expiresAt) return null

    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(`${userId}:${expiresAtStr}`)
      .digest('hex')

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return { userId }
    }
    return null
  } catch {
    return null
  }
}

export function setSessionCookie(event: H3Event, userId: string) {
  const token = createSessionToken(userId)
  setCookie(event, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE_NAME, {
    path: '/',
  })
}

export async function getUserFromSession(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE_NAME)
  if (!token) return null

  const session = verifySessionToken(token)
  if (!session) return null

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    })
    return user
  } catch {
    return null
  }
}

