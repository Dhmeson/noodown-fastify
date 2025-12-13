import dotenv from 'dotenv';

dotenv.config();

interface LogData {
  method: string;
  path: string;
  status: number;
  duration_ms: string;
  timestamp: string;
  client_ip?: string;
  user_agent?: string;
  origin?: string;
  referer?: string;
  host?: string;
  content_type?: string;
  errorMessage?: string;
}

class LogBuilder {
  private startTime: bigint;
  private responseBody: any = null;

  constructor() {
    this.startTime = process.hrtime.bigint();
  }

  setResponseBody(body: any) {
    this.responseBody = body;
  }

  build(request: any, reply: any): LogData {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - this.startTime) / 1_000_000;
    const status = reply.statusCode;

    return {
      method: request.method || "UNKNOWN",
      path: request.routerPath || request.url || "/",
      status: status,
      duration_ms: durationMs.toFixed(2),
      timestamp: new Date().toISOString(),
      client_ip: this.extractClientIp(request),
      user_agent: this.extractHeader(request, "user-agent"),
      origin: this.extractHeader(request, "origin"),
      referer: this.extractHeader(request, "referer"),
      host: this.extractHeader(request, "host"),
      content_type: this.extractHeader(request, "content-type"),
      errorMessage: this.extractErrorMessage(request, reply, status),
    };
  }

  private extractErrorMessage(request: any, reply: any, status: number): string | undefined {
    // Só extrai mensagem de erro se o status estiver entre 400 e 599
    if (status < 400 || status >= 600) {
      return undefined;
    }

    // Tenta extrair do body da resposta primeiro
    if (this.responseBody) {
      if (typeof this.responseBody === 'string') {
        try {
          const parsed = JSON.parse(this.responseBody);
          return parsed.message || parsed.error || parsed.errorMessage || this.responseBody;
        } catch {
          return this.responseBody;
        }
      }
      if (typeof this.responseBody === 'object') {
        return this.responseBody.message || 
               this.responseBody.error || 
               this.responseBody.errorMessage ||
               JSON.stringify(this.responseBody);
      }
    }

    // Tenta extrair de request.error se existir (comum em Fastify)
    if (request.error) {
      if (typeof request.error === 'string') return request.error;
      if (request.error?.message) return request.error.message;
      if (request.error?.error) return request.error.error;
    }

    // Tenta extrair de reply.error se existir
    if (reply.error) {
      if (typeof reply.error === 'string') return reply.error;
      if (reply.error?.message) return reply.error.message;
      if (reply.error?.error) return reply.error.error;
    }

    // Tenta extrair de reply.context se existir (alguns plugins do Fastify usam isso)
    if (reply.context?.error) {
      if (typeof reply.context.error === 'string') return reply.context.error;
      if (reply.context.error?.message) return reply.context.error.message;
    }

    return undefined;
  }

  private extractClientIp(request: any): string | undefined {
    const forwardedFor = this.extractHeader(request, "x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }

    const realIp = this.extractHeader(request, "x-real-ip");
    if (realIp) {
      return realIp;
    }

    if (request.ip) {
      return request.ip;
    }

    if (request.socket?.remoteAddress) {
      return request.socket.remoteAddress;
    }

    if (request.connection?.remoteAddress) {
      return request.connection.remoteAddress;
    }

    return undefined;
  }

  private extractHeader(
    request: any,
    headerName: string
  ): string | undefined {
    const headers = request.headers || {};
    const headerValue = headers[headerName] || headers[headerName.toLowerCase()];
    if (!headerValue) return undefined;
    return Array.isArray(headerValue) ? headerValue[0] : headerValue;
  }
}

function saveLog(logData: LogData) {
  const SERVER_KEY = process.env.SERVER_KEY || '';
  const url = `https://api.noodown.com/v1/logs/${SERVER_KEY}`;
  
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(logData),
    keepalive: true,
  }).catch(() => {});
}

// Hook para logging de requisições HTTP no Fastify
export async function observabilityRoutes(
  request: any,
  reply: any
) {
  const logBuilder = new LogBuilder();

  // Armazena o logBuilder no request para acesso posterior
  (request as any).__logBuilder = logBuilder;

  // Intercepta reply.send() para capturar o body da resposta
  const originalSend = reply.send.bind(reply);
  reply.send = function(payload: any) {
    logBuilder.setResponseBody(payload);
    return originalSend(payload);
  };

  // Intercepta reply.code() para manter a cadeia de métodos
  const originalCode = reply.code.bind(reply);
  reply.code = function(statusCode: number) {
    const result = originalCode(statusCode);
    // Intercepta o send do objeto retornado por code()
    const originalSendInChain = result.send.bind(result);
    result.send = function(payload: any) {
      logBuilder.setResponseBody(payload);
      return originalSendInChain(payload);
    };
    return result;
  };

  // Intercepta reply.status() também (alguns usam status ao invés de code)
  if (reply.status) {
    const originalStatus = reply.status.bind(reply);
    reply.status = function(statusCode: number) {
      const result = originalStatus(statusCode);
      const originalSendInChain = result.send.bind(result);
      result.send = function(payload: any) {
        logBuilder.setResponseBody(payload);
        return originalSendInChain(payload);
      };
      return result;
    };
  }

  // Captura erros que podem ocorrer durante o processamento
  if (reply.raw?.on) {
    reply.raw.on('error', (error: any) => {
      (request as any).__error = error;
    });
  }

  // Salva o log quando a resposta é finalizada
  if (reply.raw?.on) {
    reply.raw.on('close', () => {
      // Tenta capturar o erro do request se existir
      if ((request as any).__error) {
        (request as any).error = (request as any).__error;
      }
      const log = logBuilder.build(request, reply);
      saveLog(log);
    });
  }
}
