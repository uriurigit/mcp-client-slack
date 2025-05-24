/**
 * @file index.ts
 * @description MCP Client Slackのエントリーポイント。アプリケーションの初期化と起動処理を行う。
 * Slackクライアント、LLMクライアント、MCPクライアントを設定し、
 * アプリケーションのメインプロセスを制御する。
 * @author MCP Client Slack Team
 * @version 1.0.0
 */

import { Configuration } from './config'
import { Facilitator } from './talk/facilitator'
import { LLMClientFactory } from './llm/llmClientFactory'
import { MCPClientCoordinator } from './mcp/mcpClientCoordinator'
import { SlackBot } from './slackbot/slackBot'
import { SlackClient } from './slack/slackClient'

/**
 * アプリケーションのメイン関数
 * 設定、クライアント、ファシリテーターを初期化し、アプリケーションを起動する。
 * また、終了シグナルを処理するハンドラーも設定する。
 * @returns Promise<void>
 */
async function main(): Promise<void> {
  try {
    const config = new Configuration()

    const slackClient = new SlackClient(config.slackBotToken, config.slackAppToken)
    await slackClient.setup()

    const slackBot = new SlackBot(slackClient)
    await slackBot.postStartMessage()

    const facilitator = await createFacilitator(config)
    await slackBot.setup(facilitator)

    process.on('SIGINT', async () => {
      console.log('Shutting down...')

      await slackBot.postStopMessage()
      await slackClient.cleanup()
      await facilitator.cleanup()
      process.exit(0)
    })

    process.on('SIGTERM', async () => {
      console.log('Shutting down...')

      await slackBot.postStopMessage()
      await slackClient.cleanup()
      await facilitator.cleanup()
      process.exit(0)
    })

    console.log('Bot is running, press Ctrl+C to exit.')
  } catch (error) {
    console.error('Error starting bot:', error)
    process.exit(1)
  }
}

/**
 * ファシリテーターインスタンスを作成する
 * LLMクライアントとMCPクライアントコーディネーターを初期化し、
 * これらを組み合わせたファシリテーターインスタンスを返す。
 * @param config 設定オブジェクト
 * @returns ファシリテーターインスタンス
 */
async function createFacilitator (config: any): Promise<Facilitator> {
  const llmClient = LLMClientFactory.createClient(config.llmApiKey, config.llmModel)

  const mcpClientCoordinator = new MCPClientCoordinator()
  await mcpClientCoordinator.setup(Configuration.loadConfig())

  return new Facilitator(llmClient, mcpClientCoordinator)
} 

main().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
