import { WebClient } from '@slack/client'

const postMsg = (text: string): void => {
  const token: string = process.env.SLACK_TOKEN
  const web: WebClient = new WebClient(token)
  web.chat.postMessage({ text, channel: 'CD1M8BUM7' })
}

export default postMsg
