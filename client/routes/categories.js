var express = require('express');
var mongoose = require('mongoose');

var Categories = require('../models/categories');
var Marketplaces = require('../models/marketplaces');


var products = require('./misc/products');

var Verify = require('./verify');

var categoriesRouter = express.Router();

categoriesRouter.route('/')
// List of categories
    .get(Verify.verifyClient, function (req, res, next) {
        Categories.find({}, function (err, results) {
            if(err){
                console.log(err);
                err.status = 500;
                return next(err);
            }
            //console.log(results);
            res.json(results);
        });
});

categoriesRouter.route('/:id')
// Get products list of category {product, order}
    .get(Verify.verifyClient, function (req, res, next) {
        Categories.findById(req.params.id)
        .populate('items.product')
        .populate({
            path:     'items.product',			
            populate: { path:  'badges'}
          })
        .populate({
            path:     'items.product',			
            populate: { path:  'marketplace'}
          })
        .lean()
        .exec(function (err, result) {
            if(err){
                console.log(err);
                err.status = 500;
                return next(err);
            }
            if(result){
                let promises = [];
                result.items.forEach(element => {
                    promises.push(products.getProductTags(element.product._id)
                    .then(
                    (tags) => {
                        element.product.tags = tags;
                    },
                    (err) => {
                        return Promise.reject(err);
                    }));
                });
    
                Promise.all(promises)
                .then(() => {
                    //console.log(result);
                    res.json(result);
                },
                (err) => {
                    console.log(err);
                    err.status = 500;
                    return next(err);
                });
            } else {
                //console.log(result);
                res.json(result);
            }
            
        });
});


module.exports = categoriesRouter;