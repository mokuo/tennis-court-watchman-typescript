import buildInfo from '../../src/utils/build-info'

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
  const subject = buildInfo(availableDateTimeObj)
  const expectInfo = `10/20(土)
  - 13:00～15:00
10/27(土)
  - 13:00～15:00
  - 15:00～17:00
`

  it('build infomation to post', () => {
    expect(subject).toBe(expectInfo)
  })
})
