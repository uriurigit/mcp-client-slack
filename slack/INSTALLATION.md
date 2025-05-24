# Slack App インストールガイド

## Slackアプリを作成する

1. [api.slack.com/apps](https://api.slack.com/apps) にアクセスします
2. 「Create New App」ボタンをクリックします
3. 「From an app manifest」を選択します
4. ワークスペースを選択します
5. 「YAML」タブを選択し、`manifest.yaml`の内容をコピー＆ペーストします
6. 「Create」ボタンをクリックします

## アプリのトークンを取得する

### Botトークン

1. 左側のメニューから「OAuth & Permissions」を選択します
2. 「Bot User OAuth Token」をコピーします（`xoxb-`で始まるトークン）

### Appトークン

1. 左側のメニューから「Basic Information」を選択します
2. 「App Token」セクションまでスクロールします
3. 「Generate Token and Scopes」をクリックします
4. トークン名を入力します（例：`mcp-assistant-ts`）
5. 「Add Scope」をクリックして`connections:write`を追加します
6. 「Generate」をクリックします
7. 生成されたトークンをコピーします（`xapp-`で始まるトークン）

## 環境変数を設定する

`.env`ファイルを作成し、以下の内容を入力します：

```
# Slack API認証情報
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token

# LLM API認証情報
OPENAI_API_KEY=sk-your-openai-key
# またはGROQ_API_KEYまたはANTHROPIC_API_KEY

# LLM設定
LLM_MODEL=gpt-4o-mini
```

## アプリをワークスペースにインストールする

1. 左側のメニューから「Install App」を選択します
2. 「Install to Workspace」ボタンをクリックします
3. 認証画面で「許可する」をクリックします

## アプリの状態を確認する

1. ワークスペースで「Apps」セクションを開きます
2. 「MCP Assistant TS」が表示されることを確認します
3. アプリをクリックして、App Homeページを開きます
4. ステータスが「Active」であることを確認します

これでSlackアプリのインストールは完了です。次に、TypeScriptアプリケーションを実行して、Slackアプリを動作させることができます。