var http = require('http');
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');
var Nightmare = require('nightmare');
var vo = require('vo');
const Feed = require('feed');

const port = process.env.PORT || 4000;

function* run(url, sponsorowane) {
    var nightmare = Nightmare({
    show: true
  }),
        MAX_PAGE = 2,
        currentPage = 0,
        nextExists = true,
        links = [];


    yield nightmare
        .goto(url)
        .scrollTo(10000,0)
        .wait('.c33f1ee')
        
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
             
             var tempLinks       = [],
                   documentTitle = document.title;
                   
             for(var i = 0; i < arrayItems.length; i++){
                var arrayTitle                    = arrayItems[i].querySelector('._342830a') != null ? arrayItems[i].querySelector('._342830a').textContent : '',
                      arrayDescription        = arrayItems[i].querySelector('.bec3e46') != null ? arrayItems[i].querySelector('.bec3e46').innerHTML : '',
                      arrayLinks                  = arrayItems[i].querySelector('._342830a a') != null ? arrayItems[i].querySelector('._342830a a').href : '',
                      arrayPrice                  = arrayItems[i].querySelector('.e82f23a') != null ? arrayItems[i].querySelector('.e82f23a').textContent : '',
                      arrayTime                  = arrayItems[i].querySelector('.c589421') != null ? arrayItems[i].querySelector('.c589421').textContent : '',
                      arrayBuyNowAuction = arrayItems[i].querySelector('._1720519') != null ? arrayItems[i].querySelector('._1720519').innerHTML : '',
                      arrayInfo                     = arrayItems[i].querySelector('._7b041d2 ') != null ? arrayItems[i].querySelector('._7b041d2 ').innerHTML : '',
                      arrayPicture               = typeof arrayItems[i].querySelector('.f5826c2 img').dataset.src != 'undefined' ? arrayItems[i].querySelector('.f5826c2 img').dataset.src : arrayItems[i].querySelector('.f5826c2 img').src;
                       
                arrayDescription = arrayDescription.replace(/<dt>/g, '<span>');
                arrayDescription = arrayDescription.replace(/<\/dt>/g, ':</span> ');
                arrayDescription = arrayDescription.replace(/<dd>/g, '<strong>');
                arrayDescription = arrayDescription.replace(/<\/dd>/g, ',</strong> ');
                arrayPrice = arrayTime == '' ? arrayPrice : arrayPrice + ' - kwota licytacji';
                arrayBuyNowAuction = arrayBuyNowAuction.replace('</span><span','</span> <span');
                if (arrayItems[i].querySelector('._7b041d2').innerHTML.search('z dostawą') != -1){
                   arrayInfo = arrayItems[i].querySelector('.e4865f5').textContent;
                } else {
                   arrayInfo = 'darmowa dostawa';
                }
                if (arrayItems[i].querySelector('._7b041d2').innerHTML.search('zwrot') != -1){
                   arrayInfo += ', darmowy zwrot';
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


console.log('Run server');

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
               res.write("Oops, this doesn't exist! - 404");
               res.end();
            }
            else {
               console.log('GENERATE RSS - start');
               var sponsorowaneBool;
               if (typeof getURL.query.sponsorowane != "undefined"){
                  sponsorowaneBool = 'true'
               } else {
                  sponsorowaneBool = 'false'
               }
               vo(run(getURL.query.url, sponsorowaneBool))(function(err, result) {
                  if (err) throw err;
                  if (result) {
                     console.log('GENERATE RSS - finish');
                     var feed = new Feed({
                         title: result[0].documentTitle,
                         link: getURL.query.url,
                         image: 'https://cdn.allegrostatic.com/@metrum/brand/allegro-e2b1a7f8.svg',
                     });
                     
                     for(var i = 0; i < result.length; i++){
                        feed.addItem({
                            title: result[i].title,
                            content: result[i].description + '<div><strong>' + result[i].price + '</strong></div>' + '<div>' + result[i].time + '</div>' + '<div>' + result[i].buyNowAuction + '</div>' + '<dl>' + result[i].info + '</dl><hr>' ,
                            link: result[i].link,
                            image: result[i].picture
                        });
                     }
                     res.setHeader("Content-Type", "text/xml"); 
                     res.write(feed.rss2());
                     res.end();
                  }
               });

               //res.end();
            }
         });
         break;
      case '/index.html':
         fs.readFile(__dirname + pathName, function(error, data){
            if (error){
               res.writeHead(404);
               res.write("Oops, this doesn't exist! - 404");
               res.end();
            }
            else {
               res.writeHead(200);
               res.write(data);
               console.log('query' + query);
               console.log('INDEX HTML');
               res.end();
            }
         });
         break;
      default:
         fs.readFile(__dirname + pathName, function(error, data){
            if (error){
               res.writeHead(404);
               res.write("Oops, this doesn't exist! - 404");
               res.end();
            }
            else {
               res.writeHead(200);
               res.write(data);
               console.log('query' + query);
               res.end();
            }
         });
         break;
   }
}).listen(port, () => {
 console.log(`Server running on port ${port}`);
});