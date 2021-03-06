var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var mongodb = require('mongodb');
var Verify = require('./verify');


var saver = require('./misc/saver');
var images = require('./misc/images');
var categories = require('./misc/categories');
var shops = require('./misc/shops');
var brands = require('./misc/brands');
var tags = require('./misc/tags');
var products = require('./misc/products');
var startPage = require('./misc/startPage');
var brokenLinks = require('./misc/brokenLinks');

var Products = require('../models/products');
var Marketplaces = require('../models/marketplaces');


var productsRouter = express.Router();
productsRouter.use(bodyParser.json());

productsRouter.route('/')
// Get all products with category, brand, shop, tags and badges
    .get(Verify.verifyUser, function (req, res, next) {
        Products.find({})
        .populate('badges')
        .lean()
        .exec(function (err, result) {
            if (err) {
                console.log(err);
                err.status = 500;
                return next(err);
            }
            let promises = [];
            result.forEach((element) => {

                promises.push(products.getProductBrand(element._id)
                .then(
                (brand) => {
                    element.brand = brand;
                },
                (err) => {
                    return Promise.reject(err);
                }));

                promises.push(products.getProductCategory(element._id)
                .then(
                (category) => {
                    element.category = category;
                },
                (err) => {
                    return Promise.reject(err);
                }));

                promises.push(products.getProductShop(element._id)
                .then(
                (shop) => {
                    element.shop = shop;
                },
                (err) => {
                    return Promise.reject(err);
                }));

                promises.push(products.getProductTags(element._id)
                .then(
                (tags) => {
                    element.tags = tags;
                },
                (err) => {
                    return Promise.reject(err);
                }));
            });
            
            Promise.all(promises)
            .then(() => {
                console.log(result);
                res.json(result);
            },
            (err) => {
                console.log(err);
                err.status = 500;
                return next(err);
            });
    });
})
// Create new product
    .post(Verify.verifyUser, function (req, res, next) {

        console.log("Link: ", req.body.link);
        let product = {
            link: req.body.link,
            images: [],
            marketplace: null,
            buyLink: null,
            promoLink: null,
            brokenLinkCheck: null
        };

        let domain = saver.cutLink(req.body.link);
        console.log("Domain: ", domain);

        Marketplaces.find({}, function(err, results){

            if (err) {
                console.log(err);
                err.status = 500;
                return next(err);
            }

            for(let i = 0; i < results.length; i++){

                if(domain.indexOf(results[i].searchTag) >= 0){

                    product.marketplace = results[i]._id;
                    console.log("Marketplace: ", product.marketplace);
                    
                    let parser = require('../parsers/' + results[i].parser);

                    saver.download(req.body.link)
                    .then(page => {
                            parser.parse(page, req.body.link)
                            .then(result => {
                                let now = new Date();
                                product.brokenLinkCheck = now;
                                product.buyLink = result.buyLink;
                                console.log("Buy link: ", product.buyLink);
                                product.promoLink = saver.preparePromoLink(result.title);
                                console.log("Promo link: ", product.promoLink);
                                console.log("Image URLs: ", result.images);
                                let imagesDownloads = [];
                                result.images.forEach(function(element) {
                                    imagesDownloads.push(saver.saveImage(element)
                                    .then(imageFile => {
                                        product.images.push(imageFile);
                                    }));
                                });
                                Promise.all(imagesDownloads).then(() => {
                                    console.log("Saved images: ", product.images);

                                    Products.create(product, function (err, result) {            
                                        if (err) {
                                            console.log(err);
                                            err.status = 500;
                                            return next(err);
                                        }
                                            console.log("Product created: ", result);
                                            res.json(result);
                                    });
                                }, err => {
                                    console.log(err);
                                    err.status = 500;
                                    return next(err);
                                });
                            },
                            err => {
                                console.log(err);
                                err.status = 500;
                                return next(err);
                            });
                    });
                    break;
                } else {
                    if(i == (results.length-1)){
                        console.log("Wrong link");
                        let err = new Error("Wrong link");
                        err.status = 500;
                        return next(err);
                    }
                }
            }
        });
    });


productsRouter.route('/:id/badges/:badge_id')
// Add badge to product
    .post(Verify.verifyUser, function (req, res, next) {
        Products.findByIdAndUpdate(req.params.id, 
        { $push: {"badges": req.params.badge_id } },
        { new: true },
        function (err, result) {
            if (err) {
                console.log(err);
                err.status = 500;
                return next(err);
            }
            console.log(result);
            res.json(result);
        });
    })
// Remove badge from product
    .delete(Verify.verifyUser, function (req, res, next) {
        Products.findByIdAndUpdate(req.params.id, 
        { $pull: {"badges": req.params.badge_id } },
        { new: true },
        function (err, result) {
            if (err) {
                console.log(err);
                err.status = 500;
                return next(err);
            }
            console.log(result);
            res.json(result);
        });
    })


productsRouter.route('/:id')
// Get selected product
    .get(Verify.verifyUser, function (req, res, next) {
        Products.findById(req.params.id)
        .populate('badges')
        .populate('marketplace')
        .lean()
        .exec(function (err, result) {
            if (err) {
                console.log(err);
                err.status = 500;
                return next(err);
            }
            let promises = [];
            promises.push(products.getProductBrand(result._id)
                .then(
                (brand) => {
                    result.brand = brand;
                },
                (err) => {
                    return Promise.reject(err);
                }));

            promises.push(products.getProductCategory(result._id)
                .then(
                (category) => {
                    result.category = category;
                },
                (err) => {
                    return Promise.reject(err);
                }));

            promises.push(products.getProductShop(result._id)
                .then(
                (shop) => {
                    result.shop = shop;
                },
                (err) => {
                    return Promise.reject(err);
                }));

            promises.push(products.getProductTags(result._id)
                .then(
                (tags) => {
                    result.tags = tags;
                },
                (err) => {
                    return Promise.reject(err);
                }));
            
            
            Promise.all(promises)
            .then(() => {
                console.log(result);
                res.json(result);
            },
            (err) => {
                console.log(err);
                err.status = 500;
                return next(err);
            });
    });
    })
// Update product
    .put(Verify.verifyUser, function (req, res, next) {
        Products.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, {
                new: true
            }, function (err, result) {
                if (err) {
                    console.log(err);
                    err.status = 500;
                    return next(err);
                }
                console.log(result);
                res.json(result);
            });
    })
    
// Delete product
    .delete(Verify.verifyUser, function (req, res, next) {
        Products.findById(req.params.id, function (err, result) {
            if(err){
                console.log(err);
                err.status = 500;
                return next(err);
            }
            images.deleteProductImages(result.images, function (err, result) {
                if(err){
                    console.log(err);
                    err.status = 500;
                    return next(err);
                }
                categories.removeFromCategories(req.params.id, function (err, result) {
                    if(err){
                        console.log(err);
                        err.status = 500;
                        return next(err);
                    }
                    shops.removeFromShops(req.params.id, function (err, result) {
                        if(err){
                            console.log(err);
                            err.status = 500;
                            return next(err);
                        }
                        brands.removeFromBrands(req.params.id, function (err, result) {
                            if(err){
                                console.log(err);
                                err.status = 500;
                                return next(err);
                            }
                            tags.removeFromTags(req.params.id, function (err, result) {
                                if(err){
                                    console.log(err);
                                    err.status = 500;
                                    return next(err);
                                }
                                startPage.removeFromStartPage(req.params.id, (err, result) => {
                                    brokenLinks.removeFromBrokenLinks(req.params.id, (err, result) => {
                                        if(err){
                                            console.log(err);
                                            err.status = 500;
                                            return next(err);
                                        }
                                        Products.findByIdAndRemove(req.params.id, function (err, result) {
                                            if(err){
                                                console.log(err);
                                                err.status = 500;
                                                return next(err);
                                            }
                                            console.log(result);
                                            res.json(result);
                                        });
                                    });                              
                                });
                            });
                        });
                    });
                });
            });
        });
    });




module.exports = productsRouter;