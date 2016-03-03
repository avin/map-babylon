"use strict";
var express = require('express');
var router = express.Router();

/* GET index page. */
router.get('/', function (req, res, next) {
    let data = {title: 'Map-babylon'};
    res.render('index', data);
});

module.exports = router;
