"use strict";
var express = require('express');
var router = express.Router();

/* GET Карта. */
router.get('/', function (req, res, next) {
    let data = {title: 'Карта'};
    res.render('map', data);
});

/* GET Карта. Получить данные */
router.get('/data', function (req, res, next) {

    let db = req.app.get('mongoDb');

    (new Promise((resolve, reject) => {
        let cursor = db.collection('elements').find({},{timeout: false});
        console.log(1);

        cursor.toArray((err, docs) => {
            console.log(2);
            if (err){
                reject(new Error(err))
            }
            console.log(3);

            resolve(docs);
        });

        cursor.rewind();

    })).then((data) => {
            res.send(JSON.stringify({message: `Data get successfully`, data: data}));
        })
        .catch((error) => {
            console.log(error);
            res.send(JSON.stringify({error: error}));
        });

});

module.exports = router;
