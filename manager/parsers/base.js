// Base.com parser

var cheerio = require('cheerio');

exports.parseImages = function (page){
    return new Promise(function(resolve, reject){
        var imageJSONs = [];

        var $ = cheerio.load(page);

        let filename = $('img[id=mainImage]').attr('src');
        for(let i=filename.length-1; i >= 0; i--){
            if(filename[i] == "/"){
                filename = filename.substring(i+1);
                break;
            }
        }
        imageJSONs.push({
            "hiRes": "https://www.base.com/images/zoom/" + filename,
            "thumb": "https://www.base.com/images/standard-lclip/" + filename
        });

        if(page.indexOf('class="more-images"') >= 0){
        let part = cheerio.load($('.more-images').html());
        

        part('img').each(function(i, elem) {
            filename = $(this).attr('src');
            
            for(let i=filename.length-1; i >= 0; i--){
                if(filename[i] == "/"){
    
                    filename = filename.substring(i+1);
                    break;
                }
            }
            let imageJSON = {
                "hiRes": "https://www.base.com/images/largemedia/" + filename,
                "thumb": "https://www.base.com/images/media-thumb/" + filename
            };
            imageJSONs.push(imageJSON);
        });
    }

        //console.log(imageJSONs);
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
        
        var $=cheerio.load(page);

        title = $('title').text();
        
        if(title.length == 0){
            reject("Parser error");
        }else{
            resolve(title);
        }
    });
};
