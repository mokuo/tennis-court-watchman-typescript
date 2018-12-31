import { buildAvailableDateTimeObj } from '../src/watch-shinjuku'

describe('buildAvailableDateTimeObj()', () => {
  beforeEach(async () => {
    // TODO: 空いているテニスコートがある時のページに置き換える
    await page.goto(`file://${__dirname}/../__pages__/schedule.html`)
  })

  it('build availabble datetime object', async () => {
    const subject: object = await buildAvailableDateTimeObj(page)
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
