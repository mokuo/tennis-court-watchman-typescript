import * as puppeteer from 'puppeteer'
import { WebClient } from '@slack/client'

const clickAndWait = async (page: puppeteer.Page, selector: string): Promise<void> => {
  await Promise.all([
    page.waitForNavigation(),
    page.click(selector),
  ])
}

const evalClickAndWait = async (page: puppeteer.Page, selector: string, nextSelector: string): Promise<void> => {
  await Promise.all([
    page.waitForNavigation(),
    page.$eval(selector, (el: HTMLElement) => el.click()),
    page.waitForSelector(nextSelector),
  ])
}

const buildAvailableDateTimeObj = async (page: puppeteer.Page): Promise<object> => {
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

const buildInfo = (availableDateTimeObj: object): string => {
  let info: string = ''

  Object.keys(availableDateTimeObj).forEach((key: string) => {
    const times: string[] = availableDateTimeObj[key]
    if (times.length === 0) { return }

    info += `${key}\n`
    times.forEach((time: string) => {
      info += `  - ${time}\n`
    })
  })

  return info
}

const postMsg = (text: string): void => {
  const token: string = process.env.SLACK_TOKEN
  const web: WebClient = new WebClient(token)
  web.chat.postMessage({ text, channel: 'CD1M8BUM7' })
}

const collectAndPost = async (page: puppeteer.Page, parkName: string): Promise<void> => {
  const availableDateTimeObj: object = await buildAvailableDateTimeObj(page)
  const info: string = buildInfo(availableDateTimeObj)
  const text: string = (info === '') ? `${parkName} : no available time.` : `${parkName}\n\`\`\`\n${info}\`\`\``
  postMsg(text)
}

const watchPark = async (browser: puppeteer.Browser, parkName: string) => {
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
  await collectAndPost(page, parkName)
  await clickAndWait(page, '#timetable .top-nav input[title="次月"]')
  await collectAndPost(page, parkName)
  await context.close()
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
    await Promise.all(PARK_NAMES.map(async (parkName: string) => {
      await watchPark(browser, parkName)
    }))
    await browser.close()

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

export { watchShinjuku, buildAvailableDateTimeObj, buildInfo, postMsg, collectAndPost }
