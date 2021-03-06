var http = require('http');
var fs = require('fs');
var url = require('url');
var Nightmare = require('nightmare');
var vo = require('vo');
const Feed = require('feed');

const port = process.env.PORT || 4000;
const listenhost = process.env.LISTENHOST || "localhost";

function* runElectron(url, checkSponspored) {
    var nightmare = Nightmare({
          show: false,
          waitTimeout: 10 * 1000
      });
      
    var MAX_PAGE = 2,
          currentPage = 0,
          nextExists = true,
          links = [];
        
    yield nightmare
        .goto('about:blank')
        .cookies.set({
            name: 'gdpr_permission_given',
            value: 1,
            path: '/',
            domain: '.allegro.pl',
            url: "https://allegro.pl",
            expirationDate: 1735689600
        });

    var pageTitle = yield nightmare.goto(url).title();

    yield nightmare
        .click('button[data-role="accept-consent"]')
        .scrollTo(10000,0)
        .wait('.main-wrapper')
        .exists('._9c44d_1ojYv')
        .then(function(result) {
            if(result) {
                nightmare.end('brak aukcji');
                throw ['brak aukcji', pageTitle];
            }
        })
        .catch(function(error) {
            nightmare.end(error);
            throw error;
        });
    
    do {
        links = links.concat(yield nightmare
            .evaluate(checkSponspored => {
                var arrayItems;
                if(checkSponspored) {
                    arrayItems = Array.from(document.querySelectorAll("._9c44d_3pyzl article"));
                } else {
                    arrayItems = Array.from(document.querySelectorAll("._9c44d_3pyzl article:not([data-analytics-view-label='showSponsoredItems'])"));
                }

                var tempLinks = [],
                      documentTitle = document.title;

                for(var i = 0; i < arrayItems.length; i++) {
                   var arrayTitle                    = arrayItems[i].querySelector('._9c44d_LUA1k') !== null ? arrayItems[i].querySelector('._9c44d_LUA1k').textContent : '',
                         arrayDescription        = arrayItems[i].querySelector('._9c44d_Pjt1U') !== null ? arrayItems[i].querySelector('._9c44d_Pjt1U').innerHTML : '',
                         arrayLinks                  = arrayItems[i].querySelector('._9c44d_LUA1k a') !== null ? arrayItems[i].querySelector('._9c44d_LUA1k a').href : '',
                         arrayPrice                  = arrayItems[i].querySelector('._9c44d_2K6FN') !== null ? arrayItems[i].querySelector('._9c44d_2K6FN').textContent : '',
                         arrayTime                  = arrayItems[i].querySelector('._9c44d_3WTDC') !== null ? arrayItems[i].querySelector('._9c44d_3WTDC').textContent : '',
                         arrayBuyNowAuction = arrayItems[i].querySelector('._9c44d_3QaiE') !== null ? arrayItems[i].querySelector('._9c44d_3QaiE').innerHTML : '',
                         arrayInfo                     = arrayItems[i].querySelector('._9c44d_1xKGX') !== null ? arrayItems[i].querySelector('._9c44d_1xKGX').innerText : '',
                         arrayPicture               = arrayItems[i].querySelector('._9c44d_1ILhl img') === null ? '' : typeof arrayItems[i].querySelector('._9c44d_1ILhl img').dataset.src != 'undefined' ? arrayItems[i].querySelector('._9c44d_1ILhl img').dataset.src : arrayItems[i].querySelector('._9c44d_1ILhl img').src;

                   if(arrayLinks.includes('events/clicks?')){
                       var sponsoredLink = new URL(arrayLinks).searchParams.get('redirect');
                       arrayLinks = sponsoredLink.slice(0, sponsoredLink.indexOf('?'));
                   }

                   arrayDescription = arrayDescription.replace(/<dt>/g, '<span>');
                   arrayDescription = arrayDescription.replace(/<\/dt>/g, ':</span> ');
                   arrayDescription = arrayDescription.replace(/<dd>/g, '<strong>');
                   arrayDescription = arrayDescription.replace(/<\/dd>/g, ',</strong> ');
                   arrayPrice = arrayTime === '' ? arrayPrice : arrayPrice + ' - kwota licytacji';
                   arrayBuyNowAuction = arrayBuyNowAuction.replace('</span><span','</span> <span');
                   
                   if (arrayItems[i].querySelector('._9c44d_2bELB') !== null) {
                      if (arrayItems[i].querySelector('._9c44d_2bELB').innerHTML.search('z kurierem') != -1) {
                          arrayInfo += ', Smart z kurierem';
                      } else {
                          arrayInfo += ', Smart';
                      }
                   }
                   if (arrayItems[i].querySelector('._9c44d_1xKGX') !== null) {
                      arrayInfo += ', darmowa dostawa';
                   }
                   if (arrayItems[i].querySelector('._9c44d_YOP71') !== null) {
                      if(arrayItems[i].querySelector('._9c44d_YOP71') !== '') {
                          arrayInfo += ', ' + arrayItems[i].querySelector('._9c44d_YOP71').textContent;
                      }
                   }
                   
                   
                   tempLinks.push({'item': arrayItems[i].innerHTML, 'title': arrayTitle, 'description': arrayDescription, 'link': arrayLinks, 'price': arrayPrice, 'time': arrayTime, 'buyNowAuction': arrayBuyNowAuction, 'info': arrayInfo, 'picture': arrayPicture, 'documentTitle': documentTitle});
                }
                
                return tempLinks;
            }, checkSponspored)
        );
      
        currentPage++;
        
        nextExists = yield nightmare.visible('[data-box-name="pagination bottom"] .m-pagination__nav--next');

        if (nextExists && currentPage < MAX_PAGE) {
            yield nightmare
                .goto(url + '&p=' + (currentPage + 1))
                .wait('.main-wrapper')
        }

    } while (nextExists && currentPage < MAX_PAGE);

    yield nightmare.end();
    return links;
}

http.createServer(function (req, res) {
    var pathName = url.parse(req.url).pathname;
    if(req.method == 'GET') {
        var getURL = url.parse(req.url,true);
    }
    switch(pathName) {
        case '/generateRSS.html':
            fs.readFile(__dirname + pathName, function(error) {
                function makeRSS() {
                    vo(runElectron(getURL.query.url, isSponspored))(function(err, result) {
                        if (err) {
                            if(err[0] == 'brak aukcji') {
                                console.log('-----------');
                                console.log('Wygenerowano pusty kanał RSS, ponieważ nie ma aktywnych aukcji w podanym adresie URL: ' + getURL.query.url);
                                let feed = new Feed({
                                    title: err[1],
                                    link: getURL.query.url
                                });                                
                                res.setHeader("Content-Type", "text/xml; charset=utf-8"); 
                                res.write(feed.rss2());
                                res.end();
                            } else {
                                timeRun++;
                                if(timeRun <= 3) {
                                    console.log('Wystąpił błąd o treści:');
                                    console.log(err);
                                    console.log('-----------');
                                    console.log(timeRun + '. Próba połączenia');
                                    makeRSS();
                                } else {
                                    console.log('Wystąpił błąd o treści:');
                                    console.log(err);
                                    console.log('-----------');
                                    console.log('Przerwano generowanie RSS, ponieważ nie można odczytać podanego adresu URL: ' + getURL.query.url);
                                    res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
                                    res.write("Nie można odczytać podanej strony!");
                                    res.end();
                                }
                            }
                        }
                        if (result) {
                            console.log('-----------');
                            console.log('Uzyskano połączenie z podaną stroną i pobrano z niej dane');
                            console.log('GENEROWANIE RSS - koniec dla adresu URL: ' + getURL.query.url);
                            var feed = new Feed({
                                title: result[0].documentTitle,
                                link: getURL.query.url
                            });

                            for(var i = 0; i < result.length; i++) {
                                feed.addItem({
                                    title: result[i].title,
                                    description: result[i].description + '<div><strong>' + result[i].price + '</strong></div>' + '<div>' + result[i].time + '</div>' + '<div>' + result[i].buyNowAuction + '</div>' + '<dl>' + result[i].info + '</dl><div><img src="'+ result[i].picture +'"></div><hr>' ,
                                    link: result[i].link
                                });
                            }

                            res.setHeader("Content-Type", "text/xml; charset=utf-8"); 
                            res.write(feed.rss2());
                            res.end();
                        }
                    });   
                }
              
              
                if (error) {
                    res.writeHead(404);
                    res.write("Ten adres nie istnieje! - 404");
                    res.end();
                } else {
                    console.log('-----------');
                    console.log('GENEROWANIE RSS - start dla adresu URL: ' + getURL.query.url);
                    var isSponspored;
                    if (typeof getURL.query.sponsorowane != "undefined") {
                        isSponspored = true;
                    } else {
                        isSponspored = false;
                    }
                   
                    var timeRun = 1;                   
                    console.log(timeRun+'. Próba połączenia');
                    makeRSS();
                }
            });
            break;
        case '/index.html':
            fs.readFile(__dirname + pathName, function(error, data) {
                if (error) {
                    res.writeHead(404);
                    res.write("Ten adres nie istnieje! - 404");
                    res.end();
                }
                else {
                    res.writeHead(200);
                    res.write(data);
                    res.end();
                }
            });
            break;
        default:
            fs.readFile(__dirname + pathName, function(error, data) {
                if (error) {
                    res.writeHead(302, {'Location': 'http://' + req.headers.host + '/index.html'});
                    res.end();
                }
                else {
                    res.writeHead(200);
                    res.write(data);
                    res.end();
                }
            });
            break;
    }
}).listen(port, listenhost, () => {
    console.log(`Uruchomiono serwer na porcie ${port}`);
});
