import { Content, ContentText, Conversation, Message, Role } from '../types'

export class LLMConversation {
  private conversation: Conversation = { messages: [] }

  private convertParam (content: string | Content | Content[]): Content[] {
    if (typeof content === 'string') {
      return [{ type: 'text', text: content } as ContentText]
    } else if (Array.isArray(content)) {
      return content
    }
    return [content] // Content
  }

  public pushMessage (message: Message): void {
    if (message.role === 'system') {
      this.pushSystemContent(message.contents)
    } else if (message.role === 'user') {
      this.pushUserContent(message.contents)
    } else if (message.role === 'assistant') {
      this.pushAssistantContent(message.contents)
    }
  }

  public pushSystemContent (content: string | Content | Content[]) {
    this.pushContent('system', this.convertParam(content))
  }

  public pushUserContent (content: string | Content | Content[]) {
    this.pushContent('user', this.convertParam(content))
  }

  public pushAssistantContent (content: string | Content | Content[]) {
    this.pushContent('assistant', this.convertParam(content))
  }

  private pushContent (role: Role, content: Content | Content[]) {
    this.conversation.messages.push({ role, contents: Array.isArray(content) ? content : [content] })
  }

  public messageSize (): number {
    return this.conversation.messages.length
  }

  public getLastMessages (start: number): Message[] {
    return this.conversation.messages.slice(start)
  }
}
