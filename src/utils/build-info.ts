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

export default buildInfo
