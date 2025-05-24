import { ToolInputSchema, MCPTool } from '../types'

/**
 * ツールとそのプロパティおよびフォーマット方法を表す
 */
export class Tool implements MCPTool {
  public name: string
  public description: string
  public inputSchema: ToolInputSchema

  /**
   * コンストラクタ
   * @param name ツール名
   * @param description ツールの説明
   * @param inputSchema 入力スキーマ
   */
  constructor(name: string, description: string, inputSchema: ToolInputSchema) {
    this.name = name
    this.description = description
    this.inputSchema = inputSchema
  }

  /**
   * LLM用にツール情報をフォーマットする
   * @returns ツールを記述するフォーマット済み文字列
   */
  public formatForLLM (): string {
    const argsDesc: string[] = []
    
    if (this.inputSchema && this.inputSchema.properties) {
      for (const [paramName, paramInfo] of Object.entries(this.inputSchema.properties)) {
        let argDesc = `- ${paramName}: ${paramInfo.description || 'No description'}`
        
        if (this.inputSchema.required && this.inputSchema.required.includes(paramName)) {
          argDesc += ' (required)'
        }
        
        argsDesc.push(argDesc)
      }
    }

    return `
Tool: ${this.name}
Description: ${this.description}
Arguments:
${argsDesc.join('\n')}
`
  }
}