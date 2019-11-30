#!/usr/bin/env python3
#
# Copyright (C) 2015-2019 InSeven Limited.
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

import logging
import os

from flask import Flask, escape, request, jsonify, send_from_directory, g, make_response, redirect


ROOT_DIRECTORY = os.path.dirname(os.path.abspath(__file__))

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] [%(process)d] [%(levelname)s] %(message)s", datefmt='%Y-%m-%d %H:%M:%S %z')


app = Flask(__name__)


@app.route('/')
def index():
    return send_from_directory(ROOT_DIRECTORY, 'index.html')


@app.route('/<path:path>')
def everything_else(path):
    return send_from_directory(ROOT_DIRECTORY, path)


if __name__ == '__main__':
    app.run(host='0.0.0.0')
