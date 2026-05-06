// Simple CORS proxy for LLM Gateway
// Run: node proxy.js
// Then point frontend to http://localhost:3000/api/messages

const http = require('http');
const https = require('https');
const url = require('url');

const GATEWAY_URL = '<gateway_url>'; // e.g. https://gateway.my.llm

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, anthropic-version');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/api/fetch') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const targetUrl = payload.url;

                if (!targetUrl) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ success: false, error: 'URL required' }));
                    return;
                }

                const parsedUrl = new url.URL(targetUrl);

                const options = {
                    hostname: parsedUrl.hostname,
                    path: parsedUrl.pathname + parsedUrl.search,
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 10000,
                    rejectUnauthorized: false
                };

                const protocol = parsedUrl.protocol === 'https:' ? https : http;

                const proxyReq = protocol.request(options, (proxyRes) => {
                    let responseBody = '';

                    proxyRes.on('data', chunk => {
                        responseBody += chunk;
                    });

                    proxyRes.on('end', () => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            content: responseBody
                        }));
                    });
                });

                proxyReq.on('error', (error) => {
                    console.error('Fetch error:', error.message);
                    res.writeHead(500);
                    res.end(JSON.stringify({ success: false, error: error.message }));
                });

                proxyReq.on('timeout', () => {
                    proxyReq.destroy();
                    res.writeHead(504);
                    res.end(JSON.stringify({ success: false, error: 'Request timeout' }));
                });

                proxyReq.end();

                console.log(`[${new Date().toISOString()}] POST /api/fetch -> ${targetUrl}`);
            } catch (error) {
                console.error('Error:', error);
                res.writeHead(400);
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
    } else if (req.method === 'POST' && req.url === '/api/messages') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const parsedUrl = new url.URL(GATEWAY_URL + '/anthropic/v1/messages');

                const options = {
                    hostname: parsedUrl.hostname,
                    port: parsedUrl.port,
                    path: parsedUrl.pathname,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(body),
                        'anthropic-version': '2023-06-01',
                        'User-Agent': 'PRISM-Tool/1.0',
                        'x-llm-gateway-token': '<tokenname>'
                    },
                    rejectUnauthorized: false // For internal dev only
                };

                const proxyReq = https.request(options, (proxyRes) => {
                    let responseBody = '';

                    proxyRes.on('data', chunk => {
                        responseBody += chunk;
                    });

                    proxyRes.on('end', () => {
                        res.writeHead(proxyRes.statusCode, proxyRes.headers);
                        res.end(responseBody);
                    });
                });

                proxyReq.on('error', (error) => {
                    console.error('Proxy error:', error.message);
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: error.message }));
                });

                console.log(`[${new Date().toISOString()}] POST /api/messages -> ${GATEWAY_URL}/anthropic/v1/messages`);

                proxyReq.write(body);
                proxyReq.end();
            } catch (error) {
                console.error('Error:', error);
                res.writeHead(500);
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`\n🚀 PRISM LLM Proxy running on http://localhost:${PORT}`);
    console.log(`📡 Forwarding to: ${GATEWAY_URL}`);
    console.log(`\nUpdate your frontend to use: http://localhost:${PORT}/api/messages\n`);
});
