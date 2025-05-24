/**
 * @file mcpClientCoordinator.ts
 * @description MCPクライアントを調整し管理するコーディネータークラス。
 * 複数のMCPクライアントを初期化し、管理する機能を提供する。
 * 各クライアントからツールを収集し、適切なクライアントにツール実行を振り分ける。
 * @author MCP Client Slack Team
 * @version 1.0.0
 */
import { MCPServer } from './mcpServer'
import { ServersConfig } from '../types'
import { MCPClient } from './mcpClient'
import { Tool } from './tool'

/**
 * MCPクライアントコーディネータークラス
 * 複数のMCPクライアントを管理し、利用可能なツールを取得する。
 * 各クライアントを初期化し、清掃し、ツール実行の振り分けを行う。
 */
export class MCPClientCoordinator {
  private clients: Array<MCPClient> = []

  /**
   * 利用可能な全てのツールを取得する
   * 全てのMCPクライアントからツールを収集し、単一の配列として返す。
   * @returns 利用可能なツールの配列
   */
  public get tools (): Tool[] {
    return this.clients.flatMap(client => client.tools)
  }

  public async setup (serversConfig: ServersConfig): Promise<void> {
    for (const [name, srvConfig] of Object.entries(serversConfig?.mcpServers ?? [])) {
      const mcpClient = new MCPClient(`${name}-mcp-client`, new MCPServer(name, srvConfig))
      await mcpClient.setup()

      this.clients.push(mcpClient)
    }
  }

  public async cleanup () {
    for (const client of this.clients) {
      await client.cleanup()
    }
  }

  public includeToolOfClient (toolName: string): MCPClient | null {
    return this.clients.find(client =>
      client.tools.some(tool => tool.name === toolName)
    ) ?? null
  }
}
