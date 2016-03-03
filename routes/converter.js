"use strict";
var express = require('express');
var router = express.Router();

/* GET Конвертер. */
router.get('/', function (req, res, next) {
    let data = {title: 'Конвертер'};
    res.render('converter', data);
});

module.exports = router;
