
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
}

class LogBuilder {
  private startTime: bigint;

  constructor() {
    this.startTime = process.hrtime.bigint();
  }

  build(req: any, res: any): LogData {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - this.startTime) / 1_000_000;

    return {
      method: req.method || "UNKNOWN",
      path: req.url || "/",
      
      status: res.statusCode,
      duration_ms: durationMs.toFixed(2),
      timestamp: new Date().toISOString(),

      client_ip: req.headers['x-forwarded-for'] ||  req.headers['x-real-ip'] || req.ip,
      user_agent: req.headers['user-agent'],
      origin: req.headers['origin'],
      referer: req.headers['referer'],
      host: req.headers['host'],
      content_type: req.headers['content-type'],

    };
  }

}
// Hook para logging de requisições HTTP
export async function observabilityRoutes(
  request: any,
  reply: any,

) {
  const logBuilder = new LogBuilder();

    if (reply.raw?.on) {
    reply.raw.on('close', () => {
        const log = logBuilder.build(request, reply);
        saveLog(log);
    });
  }
    
}


function saveLog(payload:any) {
    const SERVER_KEY = process.env.SERVER_KEY || '';
    const url = `https://noodown.com/api/v1/logs/${SERVER_KEY}`;
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        keepalive: true,
    }).catch(() => { });
}
