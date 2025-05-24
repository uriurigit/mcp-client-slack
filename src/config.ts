/**
 * @file config.ts
 * @description 環境設定を管理するモジュール。環境変数の読み込み、サーバー設定の読み込み、
 * 適切なLLM APIキーの取得など、設定に関連する機能を提供する。
 * @author MCP Client Slack Team
 * @version 1.0.0
 */

import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { ServersConfig } from './types'

const ROOT_PATH = process.cwd()
const DEFAULT_LLM_MODEL = 'gpt-4o-mini'

/**
 * 環境設定を管理するクラス
 * アプリケーション全体で使用される環境変数や設定情報を管理する。
 * 環境変数の読み込み、APIキーの管理、および各種設定値の提供を行う。
 */
export class Configuration {
  public slackBotToken: string
  public slackAppToken: string
  public openaiApiKey?: string
  public groqApiKey?: string
  public anthropicApiKey?: string
  public llmModel: string

  /**
   * コンストラクタ
   * 環境変数を読み込み、必要な設定値を初期化する。
   * SLACK_BOT_TOKENとSLACK_APP_TOKENが設定されていない場合はエラーをスローする。
   */
  constructor () {
    this.loadEnv()

    this.slackBotToken = process.env.SLACK_BOT_TOKEN || ''
    this.slackAppToken = process.env.SLACK_APP_TOKEN || ''
    this.openaiApiKey = process.env.OPENAI_API_KEY
    this.groqApiKey = process.env.GROQ_API_KEY
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY
    this.llmModel = process.env.LLM_MODEL || DEFAULT_LLM_MODEL

    if (!this.slackBotToken || !this.slackAppToken) {
      throw new Error('SLACK_BOT_TOKEN and SLACK_APP_TOKEN must be set in environment variables')
    }
  }

  /**
   * 環境変数を.envファイルから読み込む
   * まずルートディレクトリの.env、次に親ディレクトリの.envを探す。
   * どちらも見つからない場合は.env.defaultを使用する。
   */
  private loadEnv (): void {
    const envPaths = [
      path.resolve(ROOT_PATH, '.env'),
      path.resolve(ROOT_PATH, '../.env')
    ]

    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath })
        console.log(`Loaded environment from ${envPath}`)
        return
      }
    }

    // デフォルト設定を使用
    const defaultEnvPath = path.resolve(ROOT_PATH, '.env.default')
    if (fs.existsSync(defaultEnvPath)) {
      dotenv.config({ path: defaultEnvPath })
      console.log(`Loaded default environment from ${defaultEnvPath}`)
    } else {
      console.warn('No .env or .env.default file found')
    }
  }

  /**
   * サーバー設定をJSONファイルから読み込む
   * @returns サーバー設定オブジェクト
   */
  public static loadConfig (): ServersConfig {
    let serverConfig = null
    try {
      const filePath = path.join(ROOT_PATH + '/config', 'servers_config.json')
      const fileContent = fs.readFileSync(path.resolve(filePath), 'utf-8')
      serverConfig = JSON.parse(fileContent) as ServersConfig
    } catch (error) {
      // ファイルが見つからない場合は、src内のファイルを探す
      const srcPath = path.resolve(ROOT_PATH, 'servers_config.json')
      console.log(`Trying to load config from ${srcPath}`)
      const fileContent = fs.readFileSync(srcPath, 'utf-8')
      serverConfig = JSON.parse(fileContent) as ServersConfig
    }

    return serverConfig
  }

  /**
   * モデルに応じたLLM APIキーを取得する
   * モデル名に基づいて最適なAPIキーを選択する。
   * gptモデルは OpenAI APIキー、llamaモデルは Groq APIキー、
   * claudeモデルは Anthropic APIキーを使用する。
   * @returns 適切な LLM APIキー
   * @throws 使用可能なAPIキーが見つからない場合にエラーをスロー
   */
  public get llmApiKey (): string {
    const model = this.llmModel.toLowerCase()

    if (model.includes('gpt') && this.openaiApiKey) {
      return this.openaiApiKey
    } else if (model.includes('llama') && this.groqApiKey) {
      return this.groqApiKey
    } else if (model.includes('claude') && this.anthropicApiKey) {
      return this.anthropicApiKey
    }

    if (this.openaiApiKey) {
      return this.openaiApiKey
    } else if (this.groqApiKey) {
      return this.groqApiKey
    } else if (this.anthropicApiKey) {
      return this.anthropicApiKey
    }

    throw new Error('No API key found for any LLM provider')
  }
}
