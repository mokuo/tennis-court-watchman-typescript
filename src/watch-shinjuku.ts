import * as puppeteer from 'puppeteer'
import { clickAndWait, evalClickAndWait } from './utils/click-and-wait'
import postMsg from './utils/post-msg'
import buildInfo from './utils/build-info'

export const buildAvailableDateTimeObj = async (page: puppeteer.Page): Promise<object> => {
  const availableDateTimeObj =
    await page.$eval('#contents #inner-contents1 #timetable .wrapper table', (tableElement: Element) => {
      const thElements: Element[] = Array.from(tableElement.querySelectorAll('thead tr th')).slice(1)
      const times: string[] = thElements.map((el: Element) => {
        return el.textContent.replace(/(\n|\t|<br>|<span>|<\/span>)/g, '')
      })
      const obj = {}

      tableElement.querySelectorAll('tbody').forEach((tbodyElement: Element) => {
        const date: string = tbodyElement.querySelector('th').textContent.trim()
        if (/[月火水木金]/.test(date)) { return }

        const availableTimeList: string[] = []
        tbodyElement.querySelectorAll('td').forEach((tdElement: Element, index: number) => {
          const imgElement: Element = tdElement.querySelector('img')
          const OX: string = imgElement.getAttribute('title')
          if (OX === 'O') {
            availableTimeList.push(times[index])
          }
        })

        obj[date] = availableTimeList
      })

      return obj
    })

  return availableDateTimeObj
}

const getParkInfos = async (browser: puppeteer.Browser, parkName: string): Promise<string[]> => {
  const infos: string[] = []

  const context: puppeteer.BrowserContext = await browser.createIncognitoBrowserContext()
  const page: puppeteer.Page = await context.newPage()
  await page.goto('https://yoyaku.cultos-y.jp/regasu-shinjuku/reserve/gin_menu')
  await clickAndWait(page, '#contents ul.double li.first input[title="かんたん操作"]')
  await clickAndWait(page, '#contents ul.double li.first input[title="空き状況確認"]')
  await clickAndWait(page, '#inner-contents a[title="屋外スポーツ施設"]')
  await clickAndWait(page, `#inner-contents tbody td.left a[title="${parkName}"]`)
  const tennisSelector = '#inner-contents ul.double-text-buttons a[title="テニス"]'
  await evalClickAndWait(page, `#inner-contents ul.double-text-buttons2 a[title^="${parkName}庭球場"]`, tennisSelector)
  await clickAndWait(page, tennisSelector)
  await clickAndWait(page, '#contents #buttons-navigation input#btnOK')
  await clickAndWait(page, '#buttons-navigation ul.triple li.first a')
  const availableDateTimeObj1: object = await buildAvailableDateTimeObj(page)
  const info1: string = buildInfo(availableDateTimeObj1)
  await clickAndWait(page, '#timetable .top-nav input[title="次月"]')
  const availableDateTimeObj2: object = await buildAvailableDateTimeObj(page)
  const info2: string = buildInfo(availableDateTimeObj2)
  await context.close()

  if (info1 !== '') infos.push(info1)
  if (info2 !== '') infos.push(info2)

  return infos
}

const watchShinjuku = async (_req: any, res: any) => {
  try {
    const PARK_NAMES: string[] = [
      '甘泉園公園',
      '落合中央公園',
      '西落合公園',
    ]

    const options: any = {}
    // run without the sandbox if running on GCP
    if (process.env.FUNCTION_NAME !== undefined) { options.args = ['--no-sandbox', '--disable-setuid-sandbox'] }
    const browser: puppeteer.Browser = await puppeteer.launch(options)
    const result: object = {}
    await Promise.all(PARK_NAMES.map(async (parkName: string) => {
      const infos: string[] = await getParkInfos(browser, parkName)
      result[parkName] = infos
      return
    }))
    await browser.close()

    let text: string = ''
    Object.keys(result).forEach((parkName: string) => {
      text += `${parkName}\n`
      const infos: string[] = result[parkName]
      if (infos.length === 0) {
        text += 'no available time.\n'
      } else {
        text += '\`\`\`\n'
        infos.forEach((info: string) => {
          text += `${info}\n`
        })
        text += '\`\`\`\n'
      }
    })

    await postMsg(text)

    res.send('Success!')
  } catch (err) {
    if (err instanceof Error) {
      console.error(err) // eslint-disable-line no-console
      res.send(`${err.name} : ${err.message}`)
    } else {
      console.error(new Error(err)) // eslint-disable-line no-console
      res.send(err)
    }
  }
}

export default watchShinjuku
