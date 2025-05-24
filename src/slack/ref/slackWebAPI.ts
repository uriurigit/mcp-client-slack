import { WebClient } from '@slack/web-api'

export class SlackWebAPI {
  private webClient: WebClient

  /**
   * コンストラクタ
   * @param slackBotToken Slack Bot Token
   */
  constructor (slackBotToken: string) {
    this.webClient = new WebClient(slackBotToken)
  }

  public async getChannels (): Promise<Array<{ id: string, name: string }>> {
    try {
      const response = (await this.webClient.conversations.list())
      return response.ok
        ? response.channels.map((conversation: any) => ({
          id: conversation.id,
          name: conversation.name
        }))
        : []
    } catch (error: any) {
      throw this.slackAPIError(error)
    }
  }

  public async getChannelForId (channelId: string): Promise<any> {
    try {
      const response = await this.webClient.conversations.info({
        channel: channelId
      })
      return response.ok ? response.channel : {}
    } catch (error: any) {
      throw this.slackAPIError(error)
    }
  }

  public async getPurpose (channelId: string): Promise<string | null> {
    const ch = await this.getChannelForId(channelId)
    return ch?.purpose?.value ?? null
  }

  public async getCannelForName (channelName: string): Promise<{ id: string, name: string } | undefined> {
    return (await this.getChannels()).find(ch => ch.name === channelName)
  }

  public async postMessageToGeneral (text: string): Promise<boolean> {
    return this.postMessageForName('general', text)
  }

  public async postMessageForName (channelName: string, text: string): Promise<boolean> {
    const channel = await this.getCannelForName(channelName)
    if (!channel) return false

    return await this.postMessageForId(channel.id, text)
  }

  public async postMessageForId (channelId: string, text: string): Promise<boolean> {
    const result = await this.webClient.chat.postMessage({ channel: channelId, text })

    return result.ok
  }

  /**
   * ユーザーIDを取得する
   */
  public async getUserId (): Promise<string | null> {
    try {
      const authInfo = await this.webClient.auth.test()
      return authInfo.user_id as string
    } catch (error) {
      console.error('Failed to get bot info:', error)
      return null
    }
  }

  private slackAPIError (error: any): any {
    console.log(error)
    if (error?.code === 'slack_webapi_platform_error' && error?.data?.error === 'missing_scope') {
      return new Error(`Slack APIの実行に必要な権限が足りません(${error?.data?.needed})`)
    }
    return error
  }
}