type ValidationDetail = {
  msg?: string
  loc?: Array<string | number>
}

const isValidationDetail = (value: unknown): value is ValidationDetail => {
  return typeof value === 'object' && value !== null
}

export function getApiErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback

  const detail = (payload as { detail?: unknown }).detail

  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (!isValidationDetail(item)) return null

        const msg = typeof item.msg === 'string' ? item.msg : null
        const loc = Array.isArray(item.loc) ? item.loc.join('.') : null

        if (msg && loc) return `${loc}: ${msg}`
        return msg
      })
      .filter((item): item is string => Boolean(item))

    if (messages.length > 0) return messages.join('; ')
  }

  return fallback
}