const http = require('http')
const fs = require('fs')
const url = require('url')
const puppeteer = require('puppeteer')
const Feed = require('feed').Feed

const port = process.env.PORT || 4000
const listenHost = process.env.LISTENHOST || "localhost"

async function getOffers(url, checkSponsoredOffers = false) {
  let MAX_PAGE = 2, currentPage = 0, isNextPageExists = true, offers = []

  const browser = await puppeteer.launch({headless: false, devtools: true})
  const page = await browser.newPage()

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36')
  await page.goto(url)
  const pageTitle = await page.title()
  const pageDescription = await page.$eval('head > meta[name="description"]', element => element.getAttribute('content'))
  await page.click('button[data-role="accept-consent"]')
  await page.waitForSelector('.main-wrapper')
  const selectorWhenNoOffersFound = await page.$$('.mzmg_6m.m9qz_yo._6a66d_-fJr5')
  if (selectorWhenNoOffersFound.length > 0) {
    await browser.close()
    return {
      'offers': {},
      'pageTitle': pageTitle,
      'pageDescription': pageDescription
    }
  }

  do {
    offers = offers.concat(await page.evaluate((checkSponsoredOffers) => {
      let arrayItems
      if (checkSponsoredOffers) {
        arrayItems = Array.from(document.querySelectorAll("._6a66d_V7Lel article"))
      } else {
        arrayItems = Array.from(document.querySelectorAll("._6a66d_V7Lel article:not([data-analytics-view-label='showSponsoredItems'])"))
      }

      let extractedOffers = []

      for (let i = 0; i < arrayItems.length; i++) {
        let arrayTitle = arrayItems[i].querySelector('._6a66d_LX75-') !== null ? arrayItems[i].querySelector('._6a66d_LX75-').textContent : '',
          arrayDescription = arrayItems[i].querySelector('.m7er_k4.mpof_5r.mpof_z0_s') !== null ? arrayItems[i].querySelector('.m7er_k4.mpof_5r.mpof_z0_s').innerHTML : '',
          arrayLinks = arrayItems[i].querySelector('._6a66d_LX75-') !== null ? arrayItems[i].querySelector('._6a66d_LX75-').href : '',
          arrayPrice = arrayItems[i].querySelector('._6a66d_6R3iN') !== null ? arrayItems[i].querySelector('._6a66d_6R3iN').textContent : '',
          arrayTime = arrayItems[i].querySelector('._6a66d_ImOzU') !== null ? arrayItems[i].querySelector('._6a66d_ImOzU').textContent : '',
          arrayBuyNowAuction = arrayItems[i].querySelector('.mqu1_g3.mvrt_0.mgn2_12') !== null ? arrayItems[i].querySelector('.mqu1_g3.mvrt_0.mgn2_12').innerHTML : '',
          arrayInfo = arrayItems[i].querySelector('.mqu1_g3.mgn2_12:not(.mvrt_0)') !== null ? arrayItems[i].querySelector('.mqu1_g3.mgn2_12:not(.mvrt_0)').innerText : '',
          arrayPicture = arrayItems[i].querySelector('._6a66d_44ioA img') === null ? '' : typeof arrayItems[i].querySelector('._6a66d_44ioA img').dataset.src != 'undefined' ? arrayItems[i].querySelector('._6a66d_44ioA img').dataset.src : arrayItems[i].querySelector('._6a66d_44ioA img').src

        if (arrayLinks.includes('events/clicks?')) {
          let sponsoredLink = new URL(arrayLinks).searchParams.get('redirect')
          arrayLinks = sponsoredLink.slice(0, sponsoredLink.indexOf('?'))
        }

        arrayDescription = arrayDescription.replace(/<\s*dt[^>]*>\b/g, '<span>')
        arrayDescription = arrayDescription.replace(/<\/dt>/g, ':</span> ')
        arrayDescription = arrayDescription.replace(/<\s*dd[^>]*>\b/g, '<strong>')
        arrayDescription = arrayDescription.replace(/<\/dd>/g, ',</strong> ')
        arrayPrice = arrayTime === '' ? arrayPrice : arrayPrice + ' - kwota licytacji'
        arrayBuyNowAuction = arrayBuyNowAuction.replace('</span><span', '</span> <span')

        if (arrayItems[i].querySelector('._6a66d_TC2Zk') !== null) {
          if (arrayItems[i].querySelector('._6a66d_TC2Zk').innerHTML.search('z kurierem') !== -1) {
            arrayInfo += ', Smart z kurierem'
          } else {
            arrayInfo += ', Smart'
          }
        }

        extractedOffers.push({
          'item': arrayItems[i].innerHTML,
          'title': arrayTitle,
          'description': arrayDescription,
          'link': arrayLinks,
          'price': arrayPrice,
          'time': arrayTime,
          'buyNowAuction': arrayBuyNowAuction,
          'info': arrayInfo,
          'picture': arrayPicture
        })
      }

      return extractedOffers
    }, checkSponsoredOffers))

    currentPage++

    isNextPageExists = await page.$(`[data-box-name="pagination bottom"] .m-pagination__nav--next`)

    if (isNextPageExists && currentPage < MAX_PAGE) {
      await page.goto(`${url}&p=(currentPage + 1)`)
      await page.waitForSelector('.main-wrapper')
    }

  } while (isNextPageExists && currentPage < MAX_PAGE)

  await browser.close()
  return {
    'offers': offers,
    'pageTitle': pageTitle,
    'pageDescription': pageDescription
  }
}

http.createServer(function (req, res) {
  let pathName = url.parse(req.url).pathname, getURL
  if (req.method === 'GET') {
    getURL = url.parse(req.url, true)
  }
  switch (pathName) {
    case '/generateRSS.html':
      fs.readFile(__dirname + pathName, function (error) {
        if (error) {
          res.writeHead(404)
          res.write(`Ten adres nie istnieje! - 404`)
          res.end()
        } else {
          console.log(`-----------`)
          console.log(`GENEROWANIE RSS - start dla adresu URL: ${getURL.query.url}`)

          let checkSponsoredOffers
          checkSponsoredOffers = typeof getURL.query.sponsorowane != "undefined";

          getOffers(getURL.query.url, checkSponsoredOffers).then(response => {
            let offers = response.offers
            if (offers.length > 0) {
              console.log(`Uzyskano połączenie z podaną stroną i pobrano z niej dane`)
              console.log(`GENEROWANIE RSS - koniec dla adresu URL: ${getURL.query.url}`)
              console.log(`-----------`)

              let feed = new Feed({
                title: response.pageTitle,
                description: response.pageDescription,
                link: getURL.query.url
              })

              for (let i = 0; i < offers.length; i++) {
                feed.addItem({
                  title: offers[i].title,
                  description: `${offers[i].description}<div><strong>${offers[i].price}</strong></div><div>${offers[i].time}</div><div>${offers[i].buyNowAuction}</div><dl>${offers[i].info}</dl><div><img src="${offers[i].picture}" alt="${offers[i].title}"></div><hr>`,
                  link: offers[i].link
                })
              }

              res.setHeader('Content-Type', 'application/xml; charset=utf-8')
              res.write(feed.rss2())
              res.end()
            } else {
              console.log(`Wygenerowano pusty kanał RSS, ponieważ nie ma aktywnych ofert w podanym adresie URL: ${getURL.query.url}`)
              console.log(`-----------`)

              let feed = new Feed({
                title: response.pageTitle,
                description: response.pageDescription,
                link: getURL.query.url
              })

              res.setHeader('Content-Type', 'application/xml; charset=utf-8')
              res.write(feed.rss2())
              res.end()
            }
          })
        }
      })
      break
    case '/index.html':
      fs.readFile(__dirname + pathName, function (error, data) {
        if (error) {
          res.writeHead(404)
          res.write(`Ten adres nie istnieje! - 404`)
          res.end()
        } else {
          res.writeHead(200)
          res.write(data)
          res.end()
        }
      })
      break
    default:
      fs.readFile(__dirname + pathName, function (error, data) {
        if (error) {
          res.writeHead(302, {'Location': `://${req.headers.host}/index.html`})
          res.end()
        } else {
          res.writeHead(200)
          res.write(data)
          res.end()
        }
      })
      break
  }
}).listen(port, listenHost, () => {
  console.log(`Uruchomiono serwer na porcie ${port}`)
})