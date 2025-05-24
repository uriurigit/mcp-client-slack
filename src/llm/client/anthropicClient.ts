import { Message } from '../../types'
import { Tool } from '../../mcp/tool'
import { LLMClient } from './llmClient'
import Anthropic from '@anthropic-ai/sdk'
import { ToolUnion } from '@anthropic-ai/sdk/resources'

/**
 * Anthropic APIと通信するためのクライアント
 */
export class AnthropicClient extends LLMClient {
  private apiKey: string
  private model: string

  /**
   * コンストラクタ
   * @param apiKey LLM APIキー
   * @param model 使用するモデル識別子
   */
  constructor (apiKey: string, model: string) {
    super()

    this.apiKey = apiKey
    this.model = model
  }

  public async sendMessage (messages: Message[], tools: Tool[]): Promise<Message> {
    // メッセージをAnthropicフォーマットに変換
    let systemMessage: string | null = null
    const anthropicMessages: { role: 'user' | 'assistant'; content: string }[] = []

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemMessage = msg.contents.join('\n')
      } else if (msg.role === 'user' || msg.role === 'assistant') {
        anthropicMessages.push({
          role: msg.role,
          content: msg.contents.map(con => (con.type === 'text') ? con.text : '').join(',')
        })
      }
    }

    const response = await new Anthropic().messages.create({
      model: this.model,
      temperature: 1,
      max_tokens: 8192,
      system: systemMessage ?? '',
      messages: anthropicMessages,
      tools: tools.map(tool => ({
        input_schema: tool.inputSchema,
        name: tool.name,
        description: tool.description
      } as ToolUnion)),
      tool_choice: {
        type: 'auto',
        disable_parallel_tool_use: false
      }
    })

    console.log(`claude response id:${response.id}`)
    return {
      role: 'assistant',
      contents: response.content.map(con => {
        if (con.type === 'text') {
          return {
            type: 'text',
            text: con.text
          }
        }

        if (con.type === 'tool_use') {
          return {
            type: 'tool_use',
            input: con.input,
            name: con.name
          }
        }

        return con
      }),
      stop_reason: response.stop_reason,
      stop_sequence: response.stop_sequence
    } as Message
  }
}
