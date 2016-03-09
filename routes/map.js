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
        let cursor = db.collection('elements').find({}, {timeout: false});
        console.log(1);

        cursor.toArray((err, docs) => {
            console.log(2);
            if (err) {
                reject(new Error(err))
            }
            console.log(3);

            resolve(docs);
        });

        cursor.rewind();

    })).then((data) => {
            res.send(JSON.stringify({message: `Data get successfully`, data: data}));
        })
        .catch((err) => {
            res.send(JSON.stringify({error: err.message}));
        });

});

/* GET Карта. Получить модель */
router.get('/model/:name', function (req, res, next) {

    let db = req.app.get('mongoDb');

    /**
     * Получение модели из базы
     * @param modelId
     */
    let getModel = (modelId) => (new Promise((resolve, reject) => {
        let cursor = db.collection('models').find({_id: modelId}, {timeout: false});

        cursor.toArray((err, docs) => {
            if (err) {
                reject(new Error(err))
            }

            if (!docs[0]) {
                reject(new Error('Model not found'))
            }

            resolve(docs[0]);
        })
    }));

    let modelNameParse;
    if (modelNameParse = req.params.name.match(/(.*)\.obj\.manifest$/i)) {
        //Имя файла не может быть пустым
        if (! modelNameParse[1]){
            res.send(JSON.stringify({error: 'Blank model name'}));
        }

        getModel(modelNameParse[1]).then((model) => {
            res.send(JSON.stringify(model.manifest));
        }).catch((err) => {
            res.send(JSON.stringify({error: err.message}));
        });

    } else if (modelNameParse = req.params.name.match(/(.*)\.obj$/i)) {
        //Имя файла не может быть пустым
        if (! modelNameParse[1]){
            res.send(JSON.stringify({error: 'Blank model name'}));
        }

        getModel(modelNameParse[1]).then((model) => {
            res.send(model.obj);
        }).catch((err) => {
            res.send(JSON.stringify({error: err.message}));
        });
    } else {
        res.send(JSON.stringify({error: 'Wrong file name'}));
    }
});

module.exports = router;
