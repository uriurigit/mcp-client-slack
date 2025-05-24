#!/bin/bash

# 環境変数の確認
if [ ! -f .env ]; then
  echo "Error: .env file not found. Please create .env file with required environment variables."
  echo "See .env.example for a template."
  exit 1
fi

# アプリを実行
echo "Starting MCP Slack Bot..."
node  --env-file=dist/.env dist/index.js