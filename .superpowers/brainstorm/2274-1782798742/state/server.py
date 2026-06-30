import http.server
import os
from email.utils import formatdate

class UTF8Handler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        f = None
        ctype = self.guess_type(path)
        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(http.HTTPStatus.NOT_FOUND, "File not found")
            return None
        try:
            fs = os.fstat(f.fileno())
            if ctype.startswith('text/'):
                ctype = ctype + '; charset=utf-8'
            self.send_response(http.HTTPStatus.OK)
            self.send_header("Content-type", ctype)
            self.send_header("Content-Length", str(fs[6]))
            self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
            self.end_headers()
            return f
        except:
            f.close()
            raise

if __name__ == '__main__':
    os.chdir('/workspace/.superpowers/brainstorm/2274-1782798742/content')
    server = http.server.HTTPServer(('0.0.0.0', 58200), UTF8Handler)
    server.serve_forever()
