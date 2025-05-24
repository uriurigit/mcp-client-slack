/**
 * @file types.ts
 * @description アプリケーション全体で使用されるインターフェースと型定義を提供するモジュール。
 * サーバー設定、LLMの会話、メッセージ形式、ツール関連の型など、
 * アプリケーションの中心的な型定義を含む。
 * @author MCP Client Slack Team
 * @version 1.0.0
 */

// サーバー設定の型
export interface ServerConfig {
  command: string
  args: string[]
  env?: Record<string, string>
  description?: string
}

// サーバー設定ファイルの型
export interface ServersConfig {
  mcpServers: Record<string, ServerConfig>
}

// ツール入力スキーマの型
export interface ToolInputSchema {
  type: string
  properties: Record<string, {
    type?: string
    description?: string
  }>
  required?: string[]
}

// ツールの型
export interface MCPTool {
  name: string
  description: string
  inputSchema: ToolInputSchema
  formatForLLM(): string; // Toolクラスと互換性を持たせるために追加
}

export interface ContentText {
  type: 'text'
  text: string
}

export interface ContentToolUse {
  type: 'tool_use'
  input?: unknown // tool_use
  name?: string // tool_use
}

export type Content = ContentText | ContentToolUse

export type Role = 'system' | 'user' | 'assistant'

// 会話メッセージの型
export interface Message {
  role: 'system' | 'user' | 'assistant'
  contents: Content[]
  stop_reason?: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use'
  stop_sequence?: string | null
}

// 会話の型
export interface Conversation {
  messages: Message[]
}

// LLMレスポンスの型
export interface LLMResponse {
  // OpenAI
  choices?: [{
    message: {
      content: string;
    }
  }]
  // Anthropic
  content?: [{
    text: string
  }]
}

// ツール実行結果の型
export type ToolResult = any
