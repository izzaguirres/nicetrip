type LogMethod = (...args: unknown[]) => void

const DEBUG_ENABLED =
  typeof process !== 'undefined' &&
  (process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true' || process.env.DEBUG_LOGS === 'true')

function output(level: 'debug' | 'info' | 'warn' | 'error', scope: string | undefined, args: unknown[]) {
  const prefix = scope ? [`[${scope}]`] : []
  ;(console[level] ?? console.log)(...prefix, ...args)
}

function createScopedLogger(scope?: string) {
  const debug: LogMethod = (...args) => {
    if (!DEBUG_ENABLED) return
    output('debug', scope, args)
  }

  const info: LogMethod = (...args) => {
    if (!DEBUG_ENABLED) return
    output('info', scope, args)
  }

  const warn: LogMethod = (...args) => {
    if (!DEBUG_ENABLED) return
    output('warn', scope, args)
  }

  const error: LogMethod = (...args) => {
    output('error', scope, args)
  }

  return { debug, info, warn, error }
}

export const logger = createScopedLogger()
export const createLogger = (scope: string) => createScopedLogger(scope)
export const isDebugLoggingEnabled = DEBUG_ENABLED
