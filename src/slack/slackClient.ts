import { App } from '@slack/bolt'
import { SlackWebAPI } from './ref/slackWebAPI'
import { SlackBoltApp } from './ref/slackBoltApp'

export class SlackClient {
  private boltApp: SlackBoltApp
  private webAPI: SlackWebAPI

  /**
   * コンストラクタ
   * @param slackBotToken Slack Bot Token
   * @param slackAppToken Slack App Token
   */
  constructor (
    slackBotToken: string,
    slackAppToken: string
  ) {
    this.boltApp = new SlackBoltApp(slackBotToken, slackAppToken)
    this.webAPI = new SlackWebAPI(slackBotToken)
  }

  public get app (): App {
    return this.boltApp
  }

  public get api (): SlackWebAPI {
    return this.webAPI
  }

  public async setup (): Promise<void> {
    await this.boltApp.setup()
  }

  /**
   * リソースをクリーンアップする
   */
  public async cleanup (): Promise<void> {
    await this.app.cleanup()
  }
}