import http.server, ssl, os

serve_dir = os.path.join(os.path.dirname(__file__), '../build')
os.chdir(serve_dir)

server_address = ('0.0.0.0', 4443)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(httpd.socket,
                               server_side=True,
                               certfile='../serving/localhost.pem', # openssl req -new -x509 -keyout localhost.pem -out localhost.pem -days 365 -nodes
                               ssl_version=ssl.PROTOCOL_TLS)
httpd.serve_forever()