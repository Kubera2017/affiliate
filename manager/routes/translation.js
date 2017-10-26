var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Translations = require('../models/translations');

var translationsRouter = express.Router();
translationsRouter.use(bodyParser.json());

translationsRouter.route('/')

    .post(function (req, res, next) {
        Translations.create(req.body, function (err, result) {
        if(err){
            console.log(err);
            err.status = 500;
            return next(err);
        }
        res.json(result);
        });
    });

translationsRouter.route('/:lang')
    .get(function (req, res, next) {
        Translations.findOne({lang: req.params.lang}, function (err, result) {
        if(err){
            console.log(err);
            err.status = 500;
            return next(err);
        }
        res.json(result);
        });
    })

    .put(function (req, res, next) {
        Translations.findOneAndUpdate({lang: req.params.lang}, {
            $set: req.body
        }, {
                new: true
            }, function (err, result) {
                if(err){
                    console.log(err);
                    err.status = 500;
                    return next(err);
                }
                res.json(result);
        });
    })

module.exports = translationsRouter;