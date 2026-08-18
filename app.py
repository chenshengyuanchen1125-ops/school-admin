#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
輕量本地 HTTP 伺服器啟動腳本
國小校務教學行政與鐘點代課整合系統
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 停用快取以便即時反映修改
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def run():
    # 切換至腳本所在資料夾
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    global PORT
    for try_port in range(8080, 8100):
        try:
            with socketserver.TCPServer(("", try_port), Handler) as httpd:
                PORT = try_port
                url = f"http://localhost:{PORT}/index.html"
                print("=" * 60)
                print("  國小校務教學行政與鐘點代課整合系統已就緒！")
                print(f"  本地網址: {url}")
                print("  提示: 可直接在瀏覽器操作，所有資料均保存在本機 IndexedDB")
                print("  按 Ctrl+C 可關閉本地伺服器")
                print("=" * 60)
                webbrowser.open(url)
                httpd.serve_forever()
                break
        except OSError:
            continue

if __name__ == '__main__':
    try:
        run()
    except KeyboardInterrupt:
        print("\n系統已正常關閉。")
        sys.exit(0)
