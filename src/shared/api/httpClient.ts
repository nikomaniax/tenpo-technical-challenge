export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'No hay conexion. Revisa tu red e intenta de nuevo.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message = 'La peticion tardo demasiado. Intenta de nuevo.') {
    super(message);
    this.name = 'TimeoutError';
  }
}

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

const DEFAULT_TIMEOUT_MS = 15_000;

export type RequestOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

function withTimeout(external: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const forwardAbort = () => controller.abort();
  external?.addEventListener('abort', forwardAbort);

  return {
    signal: controller.signal,
    didTimeout: () => timedOut,
    cleanup: () => {
      clearTimeout(timer);
      external?.removeEventListener('abort', forwardAbort);
    },
  };
}

export async function httpGet<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { signal: external, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const { signal, didTimeout, cleanup } = withTimeout(external, timeoutMs);

  try {
    const response = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    });

    if (response.status === 401) {
      unauthorizedHandler?.();
      throw new HttpError(401, 'Tu sesion expiro. Inicia sesion de nuevo.');
    }

    if (!response.ok) {
      throw new HttpError(response.status, messageForStatus(response.status));
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof HttpError) throw error;

    if (isAbortError(error)) {
      if (didTimeout()) throw new TimeoutError();
      throw error;
    }

    throw new NetworkError();
  } finally {
    cleanup();
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function messageForStatus(status: number): string {
  if (status === 403) return 'No tienes permiso para ver este contenido.';
  if (status === 404) return 'No encontramos lo que buscabas.';
  if (status === 429) return 'Demasiadas peticiones. Espera un momento e intenta de nuevo.';
  if (status >= 500) return 'El servidor no responde. Intenta de nuevo en unos minutos.';
  return 'No pudimos completar la peticion.';
}

export function toUserMessage(error: unknown): string {
  if (
    error instanceof HttpError ||
    error instanceof NetworkError ||
    error instanceof TimeoutError
  ) {
    return error.message;
  }
  return 'Ocurrio un error inesperado.';
}
