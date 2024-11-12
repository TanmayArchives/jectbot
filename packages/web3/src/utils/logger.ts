// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

class BrowserLogger {
  info(message: string, meta?: any) {
    console.log(`[INFO] ${message}`, meta || '');
  }

  warn(message: string, meta?: any) {
    console.warn(`[WARN] ${message}`, meta || '');
  }

  error(message: string, meta?: any) {
    console.error(`[ERROR] ${message}`, meta || '');
  }

  debug(message: string, meta?: any) {
    console.debug(`[DEBUG] ${message}`, meta || '');
  }
}

class ServerLogger {
  private winston: any;

  constructor() {
    if (!isBrowser) {
      this.winston = require('winston');
    }
  }

  info(message: string, meta?: any) {
    if (this.winston) {
      this.winston.info(message, meta);
    }
  }

  warn(message: string, meta?: any) {
    if (this.winston) {
      this.winston.warn(message, meta);
    }
  }

  error(message: string, meta?: any) {
    if (this.winston) {
      this.winston.error(message, meta);
    }
  }

  debug(message: string, meta?: any) {
    if (this.winston) {
      this.winston.debug(message, meta);
    }
  }
}

export const logger = isBrowser ? new BrowserLogger() : new ServerLogger(); 