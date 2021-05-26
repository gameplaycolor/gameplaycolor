#!/usr/bin/env python3

# Copyright (c) 2012-2021 InSeven Limited
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of
# this software and associated documentation files (the "Software"), to deal in
# the Software without restriction, including without limitation the rights to
# use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
# the Software, and to permit persons to whom the Software is furnished to do so,
# subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
# FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
# COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
# IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
# CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import logging
import os

from flask import Flask, escape, request, jsonify, send_from_directory, g, make_response, redirect


SERVICE_DIRECTORY = os.path.dirname(os.path.abspath(__file__))
ROOT_DIRECTORY = os.path.dirname(SERVICE_DIRECTORY)
BUILD_DIRECTORY = os.path.join(ROOT_DIRECTORY, "build")


logging.basicConfig(level=logging.INFO, format="[%(asctime)s] [%(process)d] [%(levelname)s] %(message)s", datefmt='%Y-%m-%d %H:%M:%S %z')

app = Flask(__name__)


@app.route('/')
def index():
    return send_from_directory(BUILD_DIRECTORY, 'index.html')


@app.route('/<path:path>')
def everything_else(path):
    if os.path.isdir(os.path.join(BUILD_DIRECTORY, path)):
        return send_from_directory(BUILD_DIRECTORY, os.path.join(path, "index.html"))
    return send_from_directory(BUILD_DIRECTORY, path)


if __name__ == '__main__':
    app.run(host='0.0.0.0')
