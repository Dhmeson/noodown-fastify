# noodown-fastify

Observability plugin for Fastify that sends HTTP request logs to the Noodown service.

## Installation

```bash
npm install noodown-fastify
```

## Requirements

- Node.js >= 18.0.0
- Fastify >= 5.6.2

## Configuration

Before using the plugin, you need to configure the `SERVER_KEY` environment variable with your Noodown server key.

### Using dotenv

Create a `.env` file in your project root:

```env
SERVER_KEY=your_key_here
```

The plugin automatically loads environment variables using `dotenv`.


## Usage

```javascript
import Fastify from 'fastify';
import observabilityRoutes from 'noodown-fastify';

const app = Fastify();

// Register the observability plugin
app.addHook('onRequest', observabilityRoutes);

// Your routes here
app.get('/', async (request, reply) => {
  return { hello: 'world' };
});

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});
```

## Collected Data

The plugin automatically collects the following data from each request:

- **method**: HTTP method (GET, POST, etc.)
- **path**: Request path
- **status**: HTTP response status code
- **duration_ms**: Request duration in milliseconds
- **timestamp**: Request date and time (ISO 8601)
- **client_ip**: Client IP (extracted from headers like `x-forwarded-for`, `x-real-ip`, etc.)
- **user_agent**: Client user agent
- **origin**: Origin header
- **referer**: Referer header
- **host**: Host header
- **content_type**: Request Content-Type

## How It Works

1. The `onRequest` hook is executed before each request
2. Records the start time using `process.hrtime.bigint()`
3. When the response is finalized (`close` event), builds the log with all data
4. Sends the log asynchronously to the Noodown API using `fetch` with `keepalive: true`
5. Does not block the request response (errors are silently ignored)

### Viewing and Analyzing Data

To view and analyze the collected data, you need to:
1. Register an account at [noodown.com](https://noodown.com)
2. Log in to the dashboard
3. Access your logs and analytics in the dashboard

## License

MIT
