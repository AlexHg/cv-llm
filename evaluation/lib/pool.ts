/** Ejecuta `worker` sobre `items` con concurrencia acotada, preservando el orden. */
export async function mapPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  const size = Math.max(1, Math.min(limit, items.length));
  let cursor = 0;

  async function drain() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: size }, drain));
  return results;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RetryOptions {
  retries: number;
  baseDelayMs: number;
  label: string;
  onRetry?: (attempt: number, error: unknown) => void;
}

export class RetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetryableError";
  }
}

/** Reintento con backoff exponencial y jitter. Solo reintenta `RetryableError`. */
export async function withRetry<T>(
  task: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= options.retries; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (!(error instanceof RetryableError) || attempt === options.retries) {
        break;
      }
      options.onRetry?.(attempt + 1, error);
      const backoff = options.baseDelayMs * 2 ** attempt;
      await sleep(backoff + Math.random() * options.baseDelayMs);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`${options.label}: error desconocido`);
}
