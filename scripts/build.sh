#!/bin/bash

# TypeScriptコードをコンパイル
echo "Building TypeScript code..."
npm run build

# 必要なファイルを配置
echo "Copying configuration files..."
cp config/servers_config.json dist/
cp .env dist/

echo "Build completed successfully!"