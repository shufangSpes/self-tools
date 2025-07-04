#!/bin/bash

echo "正在启动阅读记录管理应用..."
echo

# 检查是否安装了Python
if command -v python3 &> /dev/null; then
    echo "使用Python启动服务器..."
    echo "请在浏览器中访问: http://localhost:8000"
    echo "按 Ctrl+C 停止服务器"
    echo
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "使用Python启动服务器..."
    echo "请在浏览器中访问: http://localhost:8000"
    echo "按 Ctrl+C 停止服务器"
    echo
    python -m http.server 8000
# 检查是否安装了Node.js
elif command -v node &> /dev/null; then
    echo "使用Node.js启动服务器..."
    echo "请在浏览器中访问: http://localhost:8000"
    echo "按 Ctrl+C 停止服务器"
    echo
    npx serve . -p 8000
else
    echo "错误: 请先安装 Python 或 Node.js"
    echo "然后运行此脚本启动服务器"
fi 