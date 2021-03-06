var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Translations = require('../models/translations');

var translationsRouter = express.Router();
translationsRouter.use(bodyParser.json());

translationsRouter.route('/')
    .get(function (req, res, next) {
        Translations.findOne({lang: 'hebrew'}, function (err, result) {
        if(err){
            console.log(err);
            err.status = 500;
            return next(err);
        }
        res.json(result);
        });
    });


module.exports = translationsRouter;