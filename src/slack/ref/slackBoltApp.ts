import { App, SocketModeReceiver } from '@slack/bolt'

export class SlackBoltApp {
  private boltApp
  private socketModeReceiver

  /**
   * コンストラクタ
   * @param slackBotToken Slack Bot Token
   * @param slackAppToken Slack App Token
   */
  constructor (
    slackBotToken: string,
    slackAppToken: string
  ) {
    this.socketModeReceiver = new SocketModeReceiver({ appToken: slackAppToken, clientId: undefined })
    this.boltApp = new App({ token: slackBotToken, receiver: this.socketModeReceiver })
  }

  /**
   * Slack botを起動する
   */
  public async setup (): Promise<void> {
    await this.socketModeReceiver.start()
    console.log('Slack bot started and waiting for messages')
  }

  /**
   * リソースをクリーンアップする
   */
  public async cleanup (): Promise<void> {
    try {
      if (this.socketModeReceiver) {
        await this.socketModeReceiver.stop()
      }
      console.log('Slack socket mode handler closed')
    } catch (error) {
      console.error('Error closing socket mode handler:', error)
    }
  }

  public async appMention (say: ({ event, say }: any) => Promise<void>) {
    this.boltApp.event('app_mention', say)
  }
}