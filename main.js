const CSV_PATTERN = new RegExp(
  (
    // Delimiters.
    "(\\,|\\r?\\n|\\r|^)" +

    // Quoted fields.
    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

    // Standard fields.
    "([^\"\\,\\r\\n]*))"
  ),
  "gi"
)

const DOUBLE_QUOTES = new RegExp( "\"\"", "g" )

// https://www.bennadel.com/blog/1504-ask-ben-parsing-csv-strings-with-javascript-exec-regular-expression-command.htm
const parseCSV = (rawStr) => {
  const result = [[]]

  let currentMatch, currentValue

  while (currentMatch = CSV_PATTERN.exec(rawStr)) {
    const matchedStr = currentMatch[1];

    if (matchedStr.length && (matchedStr != ',')) {
      result.push([])
    }

    if (currentMatch[2]) {
      currentValue = currentMatch[2].replace(DOUBLE_QUOTES, "\"")
    } else {
      currentValue = currentMatch[3]
    }

    result[result.length - 1].push(currentValue);
  }

  return result
}

import { readFileSync, writeFileSync } from 'fs'
import { toFile } from 'qrcode'
import { render } from 'ejs'

const toBuild = readFileSync('./data/main.csv')
const ctaPage = readFileSync('./index.html.ejs').toString()
const ctaStyle = readFileSync('./style.css.ejs').toString()

parseCSV(toBuild).forEach(([companyName,title,description,ctaText,ctaUrl,qrUrl,contactInfo,themeColor], idx) => {
  if (idx === 0) return 'Skip header row'
  if (idx > 1) return 'Only generates 1 site at a time'

  const data = {
    companyName,
    title,
    description,
    ctaText,
    ctaUrl,
    qrUrl,
    contactInfo,
    themeColor
  }

  console.log(ctaPage, data)

  writeFileSync('./build/index.html', render(ctaPage, data))
  writeFileSync('./build/style.css', render(ctaStyle, data))
  toFile('./build/cta-qr.png', qrUrl, { errorCorrectionLevel: 'H' })
})
