import { Message } from '../types'

export class TalkCollection {
  public static systemRule (rules: string[]): Message {
    return {
      role: 'system',
      contents: rules.map(rule => ({
        type: 'text',
        text: rule
      }))
    }
  }

  public static toolCouldNotBeSpecified (): Message {
    return {
      role: 'assistant',
      contents: [{
        type: 'text',
        text: 'Tool could not be specified.'
      }]
    }
  }

  public static toolFailedToRun (toolName: string): Message {
    return {
      role: 'assistant',
      contents: [{
        type: 'text',
        text: `I tried to use the tool '${toolName}', but the tool failed to run.`
      }]
    }
  }

  public static toolNotAvailable (toolName: string): Message {
    return {
      role: 'assistant',
      contents: [{
        type: 'text',
        text: `I tried to use the tool '${toolName}', but it's not available.`
      }]
    }
  }

  public static usedToolAndReceivedResults (toolName: string, input: any, toolResult: any): Message[] {
    return [{
      role: 'system',
      contents: [{
        type: 'text',
        text: 'あなたは役に立つアシスタントです。ツールを使って結果を受け取りました。その結果を、ユーザーにとって分かりやすく、役立つ形で解釈してください。'
        // text: 'You are a helpful assistant. You\'ve just used a tool and received results. Interpret these results for the user in a clear, helpful way.'
      }]
    },
    {
      role: 'user',
      contents: [{
        type: 'text',
        text: `ツール ${toolName} を引数 ${JSON.stringify(input)} とともに使用して、次の結果が得られました:\n\n${JSON.stringify(toolResult, null, 2)}\n\nこの結果を解釈してください。`
        // text: `I used the tool ${toolName} with arguments ${JSON.stringify(input)} and got this result:\n\n${JSON.stringify(toolResult, null, 2)}\n\nPlease interpret this result for me.`
      }]
    }]
  }

  public static toolAndGotTheseResults (toolName: string, result: string): Message {
    return {
      role: 'assistant',
      contents: [{
        type: 'text',
        text: `I used the ${toolName} tool and got these results:\n\n\`\`\`\n${result}\n\`\`\``
      }]
    }
  }

  public static encounteredAnError (errorMessage: string): Message {
    return {
      role: 'assistant',
      contents: [{
        type: 'text',
        text: `I tried to use a tool, but encountered an error: ${errorMessage || 'Unknown error'}\n\n`
      }]
    }
  }
}
