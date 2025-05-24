import { Content, ContentToolUse, Message } from '../types'
import { LLMConversation } from './llmConversation'
import { Facilitator } from './facilitator'
import { TalkCollection } from './talkCollection'
import { MessageAgent } from './messageAgent'

export class PlaceToTalk {
  private facilitator: Facilitator
  private rules: string[] = []

  /**
   * コンストラクタ
   * @param slackBotToken Slack Bot Token
   */
  constructor (facilitator: Facilitator) {
    this.facilitator = facilitator

    this.addRule(this.facilitator.rules)
  }

  public addRule (rule: string | string[] | null) {
    if (Array.isArray(rule)) {
      this.rules = this.rules.concat(rule)
    } else if (rule) {
      this.rules.push(rule)
    }
  }

  /**
   * 受信したメッセージを処理し、応答を生成する
   * @param event イベントデータ
   * @param say メッセージ送信関数
   */
  public async processMessage (content: Content, conversation: LLMConversation, messageAgent: MessageAgent): Promise<void> {
    try {
      conversation.pushUserContent(content)

      const input = conversation.getLastMessages(-5) // 会話履歴を追加（最後の5メッセージ）
      input.unshift(TalkCollection.systemRule(this.rules))

      const llmResponseMessage = await this.facilitator.sendMessageToLLM(input)
      conversation.pushMessage(llmResponseMessage)
      messageAgent.toMessage(llmResponseMessage)

      const toolUse = llmResponseMessage.contents.find(con => con.type === 'tool_use')
      if (toolUse != null) {
        const assiatantMessage = await this.processToolCall(toolUse, conversation)
        conversation.pushMessage(assiatantMessage)
        messageAgent.toMessage(assiatantMessage)
      }
    } catch (error: any) {
      console.error('Error executing tool:', error)

      const errorMessage = TalkCollection.encounteredAnError(error.message)
      conversation.pushMessage(errorMessage)
      messageAgent.toMessage(errorMessage)
    }
  }

  /**
   * LLM応答からツールコールを処理する
   * @param response LLMからの応答
   * @param channel チャンネルID
   * @returns 処理後の応答
   */
  private async processToolCall (llmContent: ContentToolUse, conversation: LLMConversation): Promise<Message> {
    if (llmContent.name == null) {
      return TalkCollection.toolCouldNotBeSpecified()
    }

    let toolResult = null
    try {
      toolResult = await this.facilitator.executeTool(llmContent.name, llmContent.input as unknown as any)
    } catch (error) {
      console.error(`Error executing tool: ${error}`)

      return TalkCollection.toolFailedToRun(llmContent.name)
    }

    if (toolResult === null) {
      return TalkCollection.toolNotAvailable(llmContent.name)
    }

    conversation.pushSystemContent(`Tool result for ${llmContent.name}:\n${JSON.stringify(toolResult, null, 2)}`)

    try {
      const input = TalkCollection.usedToolAndReceivedResults(llmContent.name, llmContent.input, toolResult)
      input.push(TalkCollection.systemRule(this.rules))

      return await this.facilitator.sendMessageToLLM(input)
    } catch (error) {
      console.error('Error getting tool result interpretation:', error)

      // 基本的なフォーマットにフォールバック
      const resultText = (typeof toolResult === 'object')
        ? JSON.stringify(toolResult, null, 2)
        : String(toolResult)

      return TalkCollection.toolAndGotTheseResults(llmContent.name, resultText)
    }
  }
}
