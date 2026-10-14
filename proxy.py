#!/usr/bin/env python3
"""
Top_Models Local CORS Proxy
Binds strictly to 127.0.0.1:8081.
Forwards requests to upstream https endpoints with CORS headers enabled.
"""

import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request
import urllib.parse
import urllib.error

HOST = '127.0.0.1'
PORT = 8081

class CORSProxyHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Max-Age', '86400')

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.send_header('Content-Length', '0')
        self.end_headers()

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        if parsed_path.path != '/proxy':
            self.send_response(404)
            self._send_cors_headers()
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write(b'Not Found: use /proxy?url=<encoded-url>')
            return

        query_params = urllib.parse.parse_qs(parsed_path.query)
        target_urls = query_params.get('url')
        if not target_urls or not target_urls[0]:
            self.send_response(400)
            self._send_cors_headers()
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write(b'Bad Request: missing "url" query parameter')
            return

        target_url = urllib.parse.unquote(target_urls[0])
        if not target_url.startswith('https://'):
            self.send_response(400)
            self._send_cors_headers()
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write(b'Bad Request: "url" parameter must start with https://')
            return

        req = urllib.request.Request(target_url, method='GET')

        # Forward Authorization header if present
        auth_header = self.headers.get('Authorization')
        if auth_header:
            req.add_header('Authorization', auth_header)

        # Standard User-Agent
        req.add_header('User-Agent', 'TopModels-LocalProxy/1.0')

        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                status_code = response.status
                body = response.read()
                content_type = response.headers.get('Content-Type', 'application/json')

                self.send_response(status_code)
                self._send_cors_headers()
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)

        except urllib.error.HTTPError as e:
            # Pass upstream HTTP errors (401, 403, 429, etc.) through with original status & body
            status_code = e.code
            body = e.read()
            content_type = e.headers.get('Content-Type', 'application/json')

            self.send_response(status_code)
            self._send_cors_headers()
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        except Exception as e:
            # Network errors, timeouts, resolution failures -> 502 Bad Gateway
            err_msg = f"Bad Gateway (Upstream error): {str(e)}".encode('utf-8')
            self.send_response(502)
            self._send_cors_headers()
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.send_header('Content-Length', str(len(err_msg)))
            self.end_headers()
            self.wfile.write(err_msg)

    def log_message(self, format, *args):
        sys.stderr.write(f"[Proxy] {self.address_string()} - {format % args}\n")

def run():
    server_address = (HOST, PORT)
    httpd = HTTPServer(server_address, CORSProxyHandler)
    print(f"Starting local CORS proxy on http://{HOST}:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping proxy server.")
        httpd.server_close()

if __name__ == '__main__':
    run()
