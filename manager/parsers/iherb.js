// iHerb parser

var cheerio = require('cheerio');


exports.parseImages = function (page){
    return new Promise(function(resolve, reject){
        var imageJSONs = [];

        var $=cheerio.load(page);

        let imageString = $('div .thumbnail-container').html();
        $=cheerio.load(imageString);

        var promises = [];
        $('img').each(function(i, elem) {
            let imageJSON = {
                "hiRes": $(this).attr('data-large-img'),
                "thumb": $(this).attr('src')
        };
        imageJSONs.push(imageJSON);
          });

          if(imageJSONs.length == 0){
            reject("Parser error");
        }else{
        resolve(imageJSONs);
        }

    });

};

exports.parseTitle = function(page, extLink){
    return new Promise(function(resolve, reject){

        let title = "";

        title = extLink.substring(extLink.indexOf("/pr/")+4, extLink.indexOf("/", extLink.indexOf("/pr/")+4));

        if(title.length == 0){
            reject("Parser error");
        }else{
            resolve(title);
        }
    });
};
