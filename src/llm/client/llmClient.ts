import axios from 'axios'
import { Message } from '../../types'
import { Tool } from '../../mcp/tool'

/**
 * LLM APIと通信するためのクライアント
 */
export abstract class LLMClient {
  private timeout: number
  private maxRetries: number
  private axiosClient: any

  /**
   * コンストラクタ
   */
  constructor () {
    this.timeout = 30000 // 30秒タイムアウト
    this.maxRetries = 2

    this.axiosClient = axios.create({ timeout: this.timeout })
  }

  /**
   * LLM APIへメッセージを送る
   * @param messages 会話メッセージのリスト
   * @returns テキストレスポンス
   */
  public abstract sendMessage (messages: Message[], tools: Tool[]): Promise<Message>

  /**
   * APIリクエストを実行する（リトライロジック付き）
   * @param url APIエンドポイントURL
   * @param headers リクエストヘッダー
   * @param payload リクエストペイロード
   * @param extractContent レスポンスからコンテンツを抽出する関数
   * @returns テキストレスポンス
   */
  protected async makeRequest (
    url: string, 
    headers: Record<string, string>, 
    payload: any, 
    extractContent: (response: any) => string
  ): Promise<string> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.axiosClient.post(url, payload, { headers })

        return extractContent(response.data)
      } catch (error: any) {
        if (attempt === this.maxRetries) {
          return `Failed to get response: ${error.message || 'Unknown error'}`
        }

        // 指数バックオフ
        const delay = Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay * 1000))
      }
    }

    return 'Failed to get response after retries'
  }
}
