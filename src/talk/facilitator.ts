/**
 * @file facilitator.ts
 * @description 会話とツールの実行を調整する中心的なクラス。
 * LLMクライアントとMCPクライアントコーディネーターを組み合わせ、
 * メッセージのLLMへの送信やツールの実行を管理する。
 * システム全体のルールや動作設定も管理する。
 * @author MCP Client Slack Team
 * @version 1.0.0
 */
import { LLMClient } from '../llm/client/llmClient'
import { MCPClient } from '../mcp/mcpClient'
import { MCPClientCoordinator } from '../mcp/mcpClientCoordinator'
import { Message } from '../types'

export class Facilitator {
  private llmClient: LLMClient
  private mcpClientCoordinator: MCPClientCoordinator
  private ruleConversations: string[] = []

  /**
   * コンストラクタ
   * @param slackBotToken Slack Bot Token
   */
  constructor (llmClient: LLMClient, mcpClientCoordinator: MCPClientCoordinator) {
    this.llmClient = llmClient
    this.mcpClientCoordinator = mcpClientCoordinator
  }

  public get rules () {
    return this.ruleConversations
  }

  public async cleanup () {
    await this.mcpClientCoordinator.cleanup()
  }

  public getClient (toolName: string): MCPClient | null {
    return this.mcpClientCoordinator.includeToolOfClient(toolName)
  }

  public addRule (rule: string) {
    this.ruleConversations.push(rule)
  }

  public async sendMessageToLLM (messages: Message[]): Promise<Message> {
    return this.llmClient.sendMessage(messages, this.mcpClientCoordinator.tools)
  }

  public async executeTool (toolName: string, argsJson: any): Promise<object | null> {
    const client = this.getClient(toolName)
    if (client === null) return null

    return await client.executeTool(toolName, argsJson)
  }
}
