"use strict";
var express = require('express');
var router = express.Router();

/* GET Карта. */
router.get('/', function (req, res, next) {
    let data = {title: 'Карта'};
    res.render('map', data);
});

module.exports = router;
