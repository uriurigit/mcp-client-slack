/**
 * @file slackBot.ts
 * @description Slackボットの中心的な機能を提供するクラス。
 * Slackからのメッセージを受信し、処理し、応答を生成する引きまでの一連のプロセスを管理する。
 * メンションされたメッセージの実行、テストメッセージの処理、会話履歴の管理などを担当する。
 * @author MCP Client Slack Team
 * @version 1.0.0
 */

import { SlackClient } from '../slack/slackClient'
import { PlaceToTalk } from '../talk/placeToTalk'
import { LLMConversation } from '../talk/llmConversation'
import { Facilitator } from '../talk/facilitator'
import { SlackMessageAgent } from './slackMessageAgent'

/**
 * Slackボットの中心的なクラス
 * Slackからのメッセージを受信し処理する。メンションされたメッセージに対して
 * 適切な応答を生成し、会話の状態を管理する。
 */
export class SlackBot {
  private slackClient: SlackClient
  private botId: string | null = null
  private llmConversations: Record<string, LLMConversation> = {}

  /**
   * コンストラクタ
   * @param slackBotToken Slack Bot Token
   */
  constructor (slackClient: SlackClient) {
    this.slackClient = slackClient
  }

  /**
   * Slackボットをセットアップする
   * ボットIDを取得し、Slackのイベントをリッスンするよう設定する。
   * メンションされたメッセージを処理するイベントハンドラを登録する。
   * @param facilitator メッセージ処理を担当するファシリテーターインスタンス
   */
  public async setup (facilitator: Facilitator): Promise<void> {
    this.botId = await this.slackClient.api.getUserId()
    this.slackClient.app.appMention(async ({ event, say }: any) => {
      await this.processMessage(event, say, facilitator)
    })
  }

  /**
   * ボットの起動メッセージを送信する
   * ボットが起動したことを伝えるメッセージをgeneralチャンネルに送信する。
   * @returns 送信成功時はtrue、失敗時はfalse
   */
  public async postStartMessage (): Promise<boolean> {
    return await this.slackClient.api.postMessageToGeneral('Slack Bot Start...')
  }

  /**
   * ボットの終了メッセージを送信する
   * ボットが終了することを伝えるメッセージをgeneralチャンネルに送信する。
   * @returns 送信成功時はtrue、失敗時はfalse
   */
  public async postStopMessage (): Promise<boolean> {
    return await this.slackClient.api.postMessageToGeneral('Slack Bot Shutting down...')
  }

  /**
   * 受信したメッセージを処理し、応答を生成する
   * @param event イベントデータ
   * @param say メッセージ送信関数
   */
  private async processMessage (event: any, say: any, facilitator: Facilitator): Promise<void> {
    // ボット自身からのメッセージをスキップ
    if (event.user === this.botId) return

    const text = (this.botId)
      // テキストを取得し、ボットのメンションがあれば削除
      ? event.text.replace(new RegExp(`<@${this.botId}>`, 'g'), '').trim()
      : ''

    // 「メッセージテスト」だけの場合はtestMessageメソッドを呼び出す
    if (text === 'メッセージテスト') {
      await this.testMessage(event, say)
      return
    }

    const talk = new PlaceToTalk(facilitator)
    talk.addRule(await this.slackClient.api.getPurpose(event.channel))

    await talk.processMessage(
      text,
      this.getConversation(event.channel),
      new SlackMessageAgent(event.channel, event.thread_ts || event.ts, say)
    )
  }

  /**
   * テストメッセージに対する応答を生成する
   * @param event イベントデータ
   * @param say メッセージ送信関数
   */
  private async testMessage (event: any, say: any): Promise<void> {
    const sep = '```'
    const responseText = `${sep}
テストメッセージを受信しました。これはテスト応答です。
${sep}`

    await say({
      text: responseText,
      channel: event.channel,
      thread_ts: event.thread_ts || event.ts
    })
  }

  /**
   * チャンネルに紐づく会話履歴を取得する
   * チャンネルに紐づく会話履歴がない場合は新しく作成する。
   * @param channel チャンネルID
   * @returns チャンネルに紐づく会話履歴インスタンス
   */
  private getConversation (channel: string): LLMConversation {
    if (!this.llmConversations[channel]) {
      this.llmConversations[channel] = new LLMConversation()
    }
    return this.llmConversations[channel]
  }
}
