"use strict";
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

/**
 * Сохранить элемент в базе
 * @param db
 * @param data
 */
let saveElement = (db, data) => (new Promise((resolve, reject) => {

    //Данные обязательно должны присутствовать
    if (!data) {
        reject(new Error('Empty data'));
    }

    let cursor = db.collection('elements').find({_id: data.id});

    cursor.toArray((err, docs) => {
        if (err) {
            reject(err);
        }

        let element = docs[0];
        if (element) {
            //Если элемент есть - обновляем
            db.collection('elements').updateOne(
                {
                    _id: data._id
                },
                {
                    $set: data,
                    $currentDate: {"lastModified": true}
                }, (err, results) => {
                    if (err) {
                        reject(new Error('MongoDb updateDocument error'))
                    }
                    resolve(results);
                });
        } else {
            db.collection('elements').insertOne(data, (err, results) => {
                if (err) {
                    reject(new Error('MongoDb insertDocument error'))
                }
                resolve(results)
            });
        }
    });

}));

/**
 * Сохранение модели в базе
 * @param db
 * @param id
 * @param obj
 */
let saveModel = (db, id, obj) => (new Promise((resolve, reject) => {

    //Данные обязательно должны присутствовать
    if (!id) {
        reject(new Error('Wrong params'))
    }

    let cursor = db.collection('models').find({_id: id});
    cursor.toArray((err, docs) => {
        if (err) {
            reject(err);
        }

        let model = docs[0];
        if (model) {
            let manifest = model.manifest;
            manifest.version++;

            db.collection('models').updateOne(
                {
                    _id: id
                },
                {
                    $set: {
                        obj,
                        manifest
                    },
                    $currentDate: {"lastModified": true}
                }, (err, results) => {
                    if (err) {
                        reject(new Error('MongoDb updateDocument error'))
                    }
                    resolve(results);
                });
        } else {
            let manifest = {"version": 1, "enableSceneOffline": true, "enableTexturesOffline": true};
            db.collection('models').insertOne(
                {
                    _id: id,
                    obj,
                    manifest
                }, (err, results) => {
                    if (err) {
                        reject(new Error('MongoDb insertDocument error'))
                    }
                    resolve(results)
                });
        }
    });

}));

/* GET Конвертер. */
router.get('/', (req, res, next) => {
    let data = {title: 'Конвертер'};
    res.render('converter', data);
});

/* GET Конвертер. Сохранение */
router.post('/save', function (req, res, next) {
    let mongoDb = req.app.get('mongoDb');

    res.setHeader('Content-Type', 'application/json');

    let data = req.body.building;

    let id = `building_${data.id}`;

    let objFileName = path.resolve(`${__dirname}/../public/assets/models/custom/${id}.obj`);

    //Сохраняем элемент в базе
    saveElement(mongoDb, {
        "_id": id,
        "type_id": 3,
        "properties": data.properties,
        "parent": 1,
        "location": {
            "position": {
                x: data.objData.position.x || 0,
                y: data.objData.position.y || 0,
                z: data.objData.position.z || 0,
            },
            "rotation": {
                "x": 0,
                "y": 0,
                "z": 0
            }
        },
        "custom_model": true,
        "history": [],
        "states": []
    }).then(saveModel(mongoDb, id, data.objData.obj)).then(() => {
        res.send(JSON.stringify({data: [], message: 'Model saved'}));
    }).catch((err) => {
        res.send(JSON.stringify({error: err.message}));
    });

});

module.exports = router;
