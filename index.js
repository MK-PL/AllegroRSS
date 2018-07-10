var http = require('http');
var fs = require('fs');
var url = require('url');
var Nightmare = require('nightmare');
var vo = require('vo');
const Feed = require('feed');

const port = process.env.PORT || 4000;

function* runElectron(url, checkSponspored) {
    var nightmare = Nightmare({
            show: false,
            waitTimeout: 10 * 1000
        });
      
    var MAX_PAGE = 2,
        currentPage = 0,
        nextExists = true,
        links = [];

    var pageTitle = yield nightmare.goto(url).title();

    yield nightmare
        .scrollTo(10000,0)
        .wait('.main-content')
        .exists('.bb51f6c')
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
            .evaluate(function(checkSponspored) {
                var arrayItems;
                if(checkSponspored) {
                    arrayItems = Array.from(document.querySelectorAll("._8d855a8"));
                } else {
                    arrayItems = Array.from(document.querySelectorAll("._8aa57c6 ._2e710a1:not(._17557b8) ._8d855a8"));
                }

                var tempLinks = [],
                      documentTitle = document.title;

                for(var i = 0; i < arrayItems.length; i++) {
                   var arrayTitle                    = arrayItems[i].querySelector('._4462670') !== null ? arrayItems[i].querySelector('._4462670').textContent : '',
                         arrayDescription        = arrayItems[i].querySelector('._745f8e9') !== null ? arrayItems[i].querySelector('._745f8e9').innerHTML : '',
                         arrayLinks                  = arrayItems[i].querySelector('._4462670 a') !== null ? arrayItems[i].querySelector('._4462670 a').href : '',
                         arrayPrice                  = arrayItems[i].querySelector('._8c38319') !== null ? arrayItems[i].querySelector('._8c38319').textContent : '',
                         arrayTime                  = arrayItems[i].querySelector('._1fb3029') !== null ? arrayItems[i].querySelector('._1fb3029').textContent : '',
                         arrayBuyNowAuction = arrayItems[i].querySelector('._75f799c') !== null ? arrayItems[i].querySelector('._75f799c').innerHTML : '',
                         arrayInfo                     = arrayItems[i].querySelector('._87a9e6e ') !== null ? arrayItems[i].querySelector('._87a9e6e ').innerHTML : '',
                         arrayPicture               = arrayItems[i].querySelector('._8f1726f img') === null ? '' : typeof arrayItems[i].querySelector('._8f1726f img').dataset.src != 'undefined' ? arrayItems[i].querySelector('._8f1726f img').dataset.src : arrayItems[i].querySelector('._8f1726f img').src;

                   if(arrayLinks.includes('events/clicks?')){
                       var sponsoredLink = new URL(arrayLinks).searchParams.get('redirect');
                       arrayLinks = sponsoredLink.slice(0, sponsoredLink.indexOf(".html")+5);
                   }

                   arrayDescription = arrayDescription.replace(/<dt>/g, '<span>');
                   arrayDescription = arrayDescription.replace(/<\/dt>/g, ':</span> ');
                   arrayDescription = arrayDescription.replace(/<dd>/g, '<strong>');
                   arrayDescription = arrayDescription.replace(/<\/dd>/g, ',</strong> ');
                   arrayPrice = arrayTime === '' ? arrayPrice : arrayPrice + ' - kwota licytacji';
                   arrayBuyNowAuction = arrayBuyNowAuction.replace('</span><span','</span> <span');
                   
                   if (arrayItems[i].querySelector('._87a9e6e') !== null) {
                      if (arrayItems[i].querySelector('._87a9e6e').innerHTML.search('z dostawą') != -1) {
                          arrayInfo = arrayItems[i].querySelector('._25d18aa').textContent;
                      } else {
                          arrayInfo = 'darmowa dostawa';
                      }
                      if (arrayItems[i].querySelector('._87a9e6e').innerHTML.search('zwrot') != -1) {
                          arrayInfo += ', darmowy zwrot';
                      }
                   }
                   
                   tempLinks.push({'title': arrayTitle, 'description': arrayDescription, 'link': arrayLinks, 'price': arrayPrice, 'time': arrayTime, 'buyNowAuction': arrayBuyNowAuction, 'info': arrayInfo, 'picture': arrayPicture, 'documentTitle': documentTitle});
                }
                
                return tempLinks;
            }, checkSponspored)
        );
      
      nextExists = yield nightmare.visible('.opbox-pagination.bottom .next a');
      if (nextExists) {
          yield nightmare
              .click('.opbox-pagination.bottom .next a')
              .wait('._8aa57c6');
      }
      
      currentPage++;
      
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
}).listen(port, 'localhost', () => {
    console.log(`Uruchomiono serwer na porcie ${port}`);
});