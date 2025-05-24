import { Message } from '../types'

export abstract class MessageAgent {
  abstract toMessage (message: Message): Promise<void>
}
