import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { MCPServer } from './mcpServer'
import { Tool } from './tool'
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js'

export class MCPClient {
  private client: any
  private mcpServer: MCPServer
  private serverTools: Tool[] = []

  /**
   * コンストラクタ
   * @param name クライアント名
   */
  constructor (name: string, server: MCPServer) {
    this.client = new Client({ name, version: '1.0.0' })
    this.mcpServer = server
  }

  public get server (): MCPServer {
    return this.mcpServer
  }

  public get tools (): Tool[] {
    return this.serverTools
  }

  public async setup () {
    const config = this.mcpServer.getConfig()
    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args,
      env: config.env
    })
    await this.client.connect(transport)

    const result = await this.client.listTools()
    this.serverTools = result.tools.map((tool: any) => new Tool(tool.name, tool.description, tool.inputSchema))

    await this.mcpServer.initialize()

    console.log('Connected to server with tools:', this.serverTools.map(({ name }: any) => name))
  }

  public async executeTool (toolName: string, args: any): Promise<any> {
    return await this.client.request({
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      }
    }, CallToolResultSchema)
  }

  public async cleanup () {
    this.client.close()
  }
}
