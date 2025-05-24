/**
 * @file slackMessageAgent.ts
 * @description Slack用のメッセージエージェントクラス。
 * MessageAgent基底クラスを実装し、メッセージをSlackに送信する機能を提供する。
 * チャンネルやスレッド情報を管理し、メッセージのSlack形式への変換を担当する。
 * @author MCP Client Slack Team
 * @version 1.0.0
 */

import { MessageAgent } from '../talk/messageAgent'
import { Message } from '../types'

/**
 * Slack用のメッセージエージェントクラス
 * MessageAgent基底クラスを実装し、メッセージをSlackに送信する機能を実装する。
 */
export class SlackMessageAgent extends MessageAgent {
  private channelId: any
  private threadTs: any
  private say: any

  /**
   * コンストラクタ
   * @param channelId チャンネルID
   * @param threadTs スレッドのタイムスタンプ
   * @param say メッセージ送信関数
   */
  constructor (channelId: any, threadTs: any, say: any) {
    super()

    this.channelId = channelId
    this.threadTs = threadTs
    this.say = say
  }

  /**
   * メッセージをSlack形式に変換して送信する
   * メッセージオブジェクトの内容を解析し、適切な形式でSlackに送信する。
   * テキスト型とツール利用型のメッセージをサポートする。
   * @param message 送信するメッセージオブジェクト
   */
  public async toMessage (message: Message): Promise<void> {
    for (const content of message.contents) {
      const text = (con => {
        if (con.type === 'text') {
          return con.text
        } else if (con.type === 'tool_use') {
          const sep = '```'
          return `${sep}
toolName:${con.name} input:${JSON.stringify(con.input)}
${sep}`
        }
        return ''
      })(content)

      await this.publish(text)
    }
  }

  /**
   * メッセージをSlackに送信する
   * 指定されたチャンネルとスレッドにメッセージを送信する。
   * @param text 送信するメッセージテキスト
   */
  public async publish (text: string) {
    await this.say({
      text,
      channel: this.channelId,
      thread_ts: this.threadTs
    })
  }
}
