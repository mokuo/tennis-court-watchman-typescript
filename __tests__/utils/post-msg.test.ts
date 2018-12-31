import { WebClient } from '@slack/client'
import postMsg from '../../src/utils/post-msg'

jest.mock('@slack/client')

describe('postMsg()', () => {
  const mockPostMessage = jest.fn()

  beforeEach(() => {
    (WebClient as unknown as jest.Mock).mockImplementation(() => (
      { chat: { postMessage: mockPostMessage } }
    ))
    postMsg('text')
  })

  it('post message to slack', () => {
    expect(WebClient).toHaveBeenCalledWith(process.env.SLACK_TOKEN)
    expect(mockPostMessage).toHaveBeenCalledWith({ channel: 'CD1M8BUM7', text: 'text' })
  })
})
