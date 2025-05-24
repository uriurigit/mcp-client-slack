import { ServerConfig } from '../types'

export class MCPServer {
  private name: string
  private config: ServerConfig

  /**
   * コンストラクタ
   * @param name サーバー名
   * @param config サーバー設定
   */
  constructor (name: string, config: ServerConfig) {
    this.name = name
    this.config = config
  }

  public getName () {
    return this.name
  }

  public getConfig () {
    return this.config
  }

  /**
   * リソースを初期化する
   */
  public async initialize (): Promise<void> {
    // nop
  }
}
