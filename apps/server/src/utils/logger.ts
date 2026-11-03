type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

class Logger {
  private format(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const payload = {
      timestamp,
      level,
      message,
      ...(meta || {}),
    };
    return JSON.stringify(payload);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.format('DEBUG', message, meta));
    }
  }

  info(message: string, meta?: Record<string, unknown>): void {
    console.info(this.format('INFO', message, meta));
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(this.format('WARN', message, meta));
  }

  error(message: string, meta?: Record<string, unknown>): void {
    console.error(this.format('ERROR', message, meta));
  }
}

export const logger = new Logger();
