import * as puppeteer from 'puppeteer'

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

export { clickAndWait, evalClickAndWait }
