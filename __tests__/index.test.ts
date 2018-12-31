const { WebClient } = require('@slack/client')
const index = require('../index')

jest.mock('@slack/client')

describe('buildAvailableDateTimeObj()', () => {
  beforeEach(async () => {
    await page.goto(`file://${__dirname}/../__pages__/schedule.html`)
  })

  test('build availabble datetime object', async () => {
    const subject = await index.buildAvailableDateTimeObj(page)
    const expectObj = {
      '10/13(土)': [],
      '10/14(日)': [],
      '10/20(土)': [],
      '10/21(日)': [],
      '10/27(土)': [],
      '10/28(日)': [],
    }
    expect(subject).toEqual(expectObj)
  })
})

describe('buildInfo()', () => {
  const availableDateTimeObj = {
    '10/6(土)': [],
    '10/7(日)': [],
    '10/13(土)': [],
    '10/14(日)': [],
    '10/20(土)': [
      '13:00～15:00',
    ],
    '10/21(日)': [],
    '10/27(土)': [
      '13:00～15:00',
      '15:00～17:00',
    ],
    '10/28(日)': [],
  }
  const subject = index.buildInfo(availableDateTimeObj)
  const expectInfo = `10/20(土)
  - 13:00～15:00
10/27(土)
  - 13:00～15:00
  - 15:00～17:00
`

  test('build infomation to post', () => {
    expect(subject).toBe(expectInfo)
  })
})

describe('postMsg()', () => {
  const mockPostMessage = jest.fn()

  beforeEach(() => {
    WebClient.mockImplementation(() => (
      { chat: { postMessage: mockPostMessage } }
    ))
    index.postMsg('text')
  })

  test('post message to slack', () => {
    expect(WebClient).toHaveBeenCalledWith(process.env.SLACK_TOKEN)
    expect(mockPostMessage).toHaveBeenCalledWith({ channel: 'CD1M8BUM7', text: 'text' })
  })
})

describe('collectAndPost()', () => {
  describe('when there is available time', () => {

  })

  describe('when there is no available time', () => {})
})
