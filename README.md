# MCP Client Slackbot TypeScript

Model Context Protocol (MCP)を使用したSlack botをTypeScriptで実装しています。
このプロジェクトは、LLM（Large Language Model）とMCPツールを組み合わせて、Slackワークスペース内で強力なAIアシスタント機能を提供します。

![MCP Client Slackbot TS Architecture](https://github.com/user-attachments/assets/0e2b6e1c-80f2-48c3-8ca4-1c41f3678478)

## ✨ 特徴

- **🤖 AI搭載アシスタント**: チャンネルやDMでのメッセージに応答するLLM機能
- **🔧 MCP連携**: ファイルシステム、Web、Miroなどの多様なMCPツールへのフルアクセス
- **🔀 LLMサポート**: 現在はAnthropicのみ対応
- **🏠 App Homeタブ**: 利用可能なツールと使用方法情報を表示
- **📁 リソース管理**: 独自の非同期リソース管理システムによる安定した動作

## 🚀 クイックスタート

```bash
# プロジェクトディレクトリに移動
cd mcp-client-slack

# 依存関係のインストール、ビルド、実行
make run
```

## 📋 セットアップガイド

### 1. 前提条件

- Node.js 18.0以上
- npm または yarn
- Slackワークスペースの管理者権限

### 2. Slack Appを作成する

[slack/INSTALLATION.md](slack/INSTALLATION.md)の手順に従って、Slackアプリを作成・設定します。

### 3. 依存関係をインストール

```bash
# 依存関係をインストール
npm install

# または
make setup
```

### 4. 環境変数の設定

プロジェクトルートに`.env`ファイルを作成します：

```bash
# .env.exampleをコピーして編集
cp .env.example .env
```

`.env`ファイルの内容：

```env
# Slack API認証情報
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_APP_TOKEN=xapp-your-token

# LLM API認証情報（いずれか1つ以上）
OPENAI_API_KEY=sk-your-openai-key
GROQ_API_KEY=gsk-your-groq-key
ANTHROPIC_API_KEY=your-anthropic-key

# LLM設定
LLM_MODEL=gpt-4o-mini
```

### 5. MCPサーバー設定

`config/servers_config.json`で利用するMCPサーバーを設定します：

```json
{
  "mcpServers": {
    "file-system-on-wsl": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/home/user/workspace"
      ]
    },
    "miro": {
      "command": "npx",
      "args": [
        "-y",
        "@llmindset/mcp-miro",
        "--token",
        "your-miro-token"
      ]
    }
  }
}
```

### 6. ビルドと実行

```bash
# ビルド
npm run build

# 実行
npm start

# または、Makefileを使用
make run
```

## 🎯 使用方法

### 基本的なやり取り

- **ダイレクトメッセージ**: ボットにダイレクトメッセージを送信
- **チャンネルメンション**: チャンネルで`@MCP Assistant TS`とボットをメンション
- **App Home**: ボットのApp Homeタブにアクセスして、利用可能なツールを確認

### 利用可能なツール

設定されたMCPサーバーに応じて、以下のような機能が利用できます：

- **ファイル操作**: ファイルの読み込み、書き込み、検索
- **Web検索**: インターネット上の情報検索
- **Miro連携**: Miroボードの操作
- **クラウドリソース管理**: AWS、GCPなどのクラウドリソースの管理

## 📁 プロジェクト構造

```
mcp-client-slack/
├── config/                   # 設定ファイル
│   └── servers_config.json   # MCPサーバー設定
├── dist/                     # コンパイル済みJavaScriptファイル
├── scripts/                  # ビルド・実行スクリプト
│   ├── build.sh              # ビルドスクリプト
│   └── run.sh                # 実行スクリプト
├── slack/                    # Slack関連設定ファイル
│   ├── manifest.yaml         # Slackアプリマニフェスト
│   └── INSTALLATION.md       # Slackアプリインストール手順
├── src/                      # ソースコード
│   ├── config.ts             # 設定管理
│   ├── index.ts              # エントリーポイント
│   ├── types.ts              # 型定義
│   ├── llm/                  # LLM関連
│   │   ├── client/           # LLMクライアント実装
│   │   └── llmClientFactory.ts
│   ├── mcp/                  # MCP関連
│   │   ├── mcpClient.ts      # MCPクライアント
│   │   ├── mcpClientCoordinator.ts
│   │   ├── mcpServer.ts      # MCPサーバー管理
│   │   └── tool.ts           # ツールクラス
│   ├── slack/                # Slack API関連
│   │   └── slackClient.ts    # Slackクライアント
│   ├── slackbot/             # Slackボット関連
│   │   ├── slackBot.ts       # メインボットクラス
│   │   └── slackMessageAgent.ts
│   └── talk/                 # 会話管理
│       ├── facilitator.ts    # 会話ファシリテーター
│       ├── llmConversation.ts
│       ├── messageAgent.ts
│       ├── placeToTalk.ts
│       └── talkCollection.ts
├── .env.example             # 環境変数テンプレート
├── .eslintrc.json           # ESLint設定
├── .gitignore               # Git無視ファイル設定
├── .prettierrc              # Prettier設定
├── DEVELOPMENT.md           # 開発者向けドキュメント
├── Makefile                 # ビルド・実行自動化
├── package.json             # npm設定
└── tsconfig.json            # TypeScript設定
```

## 🏗️ アーキテクチャ

### 主要コンポーネント

1. **設定管理** (`config.ts`)
   - 環境変数の読み込み
   - サーバー設定の管理
   - LLM APIキーの取得

2. **LLMクライアント** (`llm/`)
   - OpenAI、Groq、Anthropic APIとの連携
   - レスポンス処理とリトライロジック
   - ファクトリーパターンによるクライアント生成

3. **MCPクライアント** (`mcp/`)
   - MCPサーバープロセスの起動・管理
   - ツールの検出と実行
   - リソースのクリーンアップ

4. **Slackボット** (`slackbot/`, `slack/`)
   - Slackイベント処理
   - メッセージ処理とレスポンス生成
   - App Home機能

5. **会話管理** (`talk/`)
   - 会話コンテキストの管理
   - メッセージの履歴管理
   - LLMとツールの連携

### データフロー

1. ユーザーがSlackでメッセージを送信
2. `SlackBot`がメッセージを受信
3. `Facilitator`が会話コンテキストを管理
4. LLMがレスポンスを生成（必要に応じてツール呼び出しを含む）
5. ツール呼び出しがある場合は`MCPClient`を通じてツールを実行
6. 実行結果をLLMに送り返して解釈を求める
7. 最終的なレスポンスをSlackに返送

### 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone <リポジトリURL>
cd mcp-client-slack

# 依存関係のインストール
make setup

# 開発モードで実行（ソースファイルを監視して自動リロード）
npm run dev
```

### 利用可能なコマンド

```bash
# ビルドのみ
make build

# ビルドと実行
make run

# クリーンビルド
make clean build

# Linting
npm run lint

# テスト（予定）
npm test
```

## 🤝 貢献

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📄 ライセンス

MITライセンス - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 🙏 謝辞

このプロジェクトは[MCP Simple Slackbot](https://github.com/modelcontextprotocol/python-sdk/tree/main/examples/clients/simple-chatbot)をベースにTypeScriptで再実装されました。

## 📞 サポート

問題が発生した場合は、以下の手順で確認してください：

1. `.env`ファイルが正しく設定されているか確認
2. 必要な依存関係がインストールされているか確認
3. Slackアプリの権限が正しく設定されているか確認
4. MCPサーバーの設定が正しいか確認

詳細な設定方法については、`slack/INSTALLATION.md`を参照してください。
