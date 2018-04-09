var http = require('http');
var fs = require('fs');
var url = require('url');
var Nightmare = require('nightmare');
var vo = require('vo');
const Feed = require('feed');

const port = process.env.PORT || 4000;

function* run(url, sponsorowane) {
    var nightmare = Nightmare({
              show: false,
              waitTimeout: 10 * 1000
          });
      
    var MAX_PAGE = 2,
          currentPage = 0,
          nextExists = true,
          links = [];

    yield nightmare
        .goto(url)
        .scrollTo(10000,0)
        .wait('.c33f1ee')
        .catch(function(error){
            nightmare.end(error);
            throw error;
        })
        
    var documentTitle;

    do {
        links = links.concat(yield nightmare
            .evaluate(function(sponsorowane) {
                var arrayItems;
                if(sponsorowane == 'true'){
                    arrayItems = Array.from(document.querySelectorAll(".fa72b28"));
                } else {
                    arrayItems = Array.from(document.querySelectorAll("._61aa5c3:not(._61c59e4) .fa72b28"));
                }
               
                var tempLinks = [],
                      documentTitle = document.title;
                     
                for(var i = 0; i < arrayItems.length; i++){
                   var arrayTitle                    = arrayItems[i].querySelector('._342830a') != null ? arrayItems[i].querySelector('._342830a').textContent : '',
                         arrayDescription        = arrayItems[i].querySelector('.bec3e46') != null ? arrayItems[i].querySelector('.bec3e46').innerHTML : '',
                         arrayLinks                  = arrayItems[i].querySelector('._342830a a') != null ? arrayItems[i].querySelector('._342830a a').href : '',
                         arrayPrice                  = arrayItems[i].querySelector('.e82f23a') != null ? arrayItems[i].querySelector('.e82f23a').textContent : '',
                         arrayTime                  = arrayItems[i].querySelector('.c589421') != null ? arrayItems[i].querySelector('.c589421').textContent : '',
                         arrayBuyNowAuction = arrayItems[i].querySelector('._1720519') != null ? arrayItems[i].querySelector('._1720519').innerHTML : '',
                         arrayInfo                     = arrayItems[i].querySelector('._7b041d2 ') != null ? arrayItems[i].querySelector('._7b041d2 ').innerHTML : '',
                         arrayPicture               = arrayItems[i].querySelector('.f5826c2 img') == null ? '' : typeof arrayItems[i].querySelector('.f5826c2 img').dataset.src != 'undefined' ? arrayItems[i].querySelector('.f5826c2 img').dataset.src : arrayItems[i].querySelector('.f5826c2 img').src;
                         
                   arrayDescription = arrayDescription.replace(/<dt>/g, '<span>');
                   arrayDescription = arrayDescription.replace(/<\/dt>/g, ':</span> ');
                   arrayDescription = arrayDescription.replace(/<dd>/g, '<strong>');
                   arrayDescription = arrayDescription.replace(/<\/dd>/g, ',</strong> ');
                   arrayPrice = arrayTime == '' ? arrayPrice : arrayPrice + ' - kwota licytacji';
                   arrayBuyNowAuction = arrayBuyNowAuction.replace('</span><span','</span> <span');
                   
                   if (arrayItems[i].querySelector('._7b041d2') != null){
                      if (arrayItems[i].querySelector('._7b041d2').innerHTML.search('z dostawą') != -1){
                          arrayInfo = arrayItems[i].querySelector('.e4865f5').textContent;
                      } else {
                          arrayInfo = 'darmowa dostawa';
                      }
                      if (arrayItems[i].querySelector('._7b041d2').innerHTML.search('zwrot') != -1){
                          arrayInfo += ', darmowy zwrot';
                      }
                   }
                   
                   tempLinks.push({'title': arrayTitle, 'description': arrayDescription, 'link': arrayLinks, 'price': arrayPrice, 'time': arrayTime, 'buyNowAuction': arrayBuyNowAuction, 'info': arrayInfo, 'picture': arrayPicture, 'documentTitle': documentTitle});
                }
                
                return tempLinks;
            }, sponsorowane)
        );
      
      nextExists = yield nightmare.visible('.opbox-pagination.bottom .next a');
      if (nextExists) {
          yield nightmare
              .click('.opbox-pagination.bottom .next a')
              .wait('.c33f1ee')
      }
      
      currentPage++;
      
    } while (nextExists && currentPage < MAX_PAGE);

    yield nightmare.end();
    return links;
}

http.createServer(function (req, res) {
    pathName = url.parse(req.url).pathname;
    query = url.parse(req.url).query;
    if(req.method=='GET') {
        var getURL = url.parse(req.url,true);
    }
    switch(pathName){
        case '/generateRSS.html':
            fs.readFile(__dirname + pathName, function(error, data){
                if (error){
                    res.writeHead(404);
                    res.write("Ten adres nie istnieje! - 404");
                    res.end();
                } else {
                    console.log('-----------');
                    console.log('GENEROWANIE RSS - start dla adresu URL: ' + getURL.query.url);
                    var sponsorowaneBool;
                    if (typeof getURL.query.sponsorowane != "undefined"){
                        sponsorowaneBool = 'true'
                    } else {
                        sponsorowaneBool = 'false'
                    }
                   
                    timeRun = 1;
                    function makeRSS(){
                        vo(run(getURL.query.url, sponsorowaneBool))(function(err, result) {
                            if (err) {
                                timeRun++;
                                if(timeRun <= 3){
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
                                    //throw err;
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
                               
                                for(var i = 0; i < result.length; i++){
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
                   
                    console.log(timeRun+'. Próba połączenia');
                    makeRSS();
                }
            });
            break;
        case '/index.html':
            fs.readFile(__dirname + pathName, function(error, data){
                if (error){
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
            fs.readFile(__dirname + pathName, function(error, data){
                if (error){
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