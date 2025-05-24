/**
 * @file llmClientFactory.ts
 * @description LLMクライアントを生成するファクトリークラス。
 * モデル名に基づいて適切なLLMクライアントインスタンスを生成する。
 * 現在はClaudeモデルをサポートしている。
 * @author MCP Client Slack Team
 * @version 1.0.0
 */

import { AnthropicClient } from './client/anthropicClient'
import { LLMClient } from './client/llmClient'

/**
 * LLM クライアント生成
 */
export class LLMClientFactory {
  /**
   * LLMからのレスポンスを取得する
   * @param apiKey LLM APIキー
   * @param model 使用するモデル識別子
   * @returns LLMからのテキストレスポンス
   */
  public static createClient (apiKey: string, model: string): LLMClient {
    if (model.startsWith('claude-')) {
      return new AnthropicClient(apiKey, model)
    }

    throw new Error(`Unsupported model: ${model}`)
  }
}
