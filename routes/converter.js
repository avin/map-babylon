"use strict";
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

/**
 * Обновление манифеста obj файла
 * @param manifestFile
 * @returns {Promise}
 */
let updateManifest = (manifestFile) => (new Promise(function (resolve, reject) {
    let manifest;

    fs.readFile(manifestFile, 'utf8', function (err, data) {
        let newManifest = {
            version: 1,
            enableSceneOffline: true,
            enableTexturesOffline: true
        };

        if (err) {

            //Манифеста нет - создаем новый
            manifest = newManifest;

            fs.writeFile(manifestFile, JSON.stringify(manifest), function (err) {
                if (err) {
                    reject(new Error("Manifest save error"));
                }

                resolve();
            });

        } else {

            //Мафнифест есть - обновляем версию
            try {
                manifest = JSON.parse(data);
                manifest.version++;
            } catch (e) {
                manifest = newManifest;
            }

            fs.writeFile(manifestFile, JSON.stringify(manifest), function (err) {
                if (err) {
                    reject(new Error("Manifest save error"));
                }

                resolve();
            });
        }
    });
}));

/**
 * Сохранить элемент в базе
 * @param db
 * @param data
 */
let saveElement = (db, data) => (new Promise((resolve, reject) => {
    //Данные обязательно должны присутствовать
    if (!data) {
        return false;
    }

    /**
     * Определяем что элемент в базе
     * @param db
     */
    var elementIsPresent = (db) => (new Promise((resolve, reject) => {
        db.collection('elements').find({_id: data._id}).count((err, count) => {
            if (err) {
                reject(new Error('MongoDb elementIsPresent error'))
            }
            resolve(!!count);
        });
    }));

    /**
     * Добавляем элемент
     * @param db
     */
    var insertDocument = (db) => (
        new Promise((resolve, reject) => {
            db.collection('elements').insertOne(data, (err, results) => {
                if (err) {
                    reject(new Error('MongoDb insertDocument error'))
                }
                resolve(results)
            });
        }));

    /**
     * Обновляем элемента
     * @param db
     */
    var updateDocument = (db) => (
        new Promise((resolve, reject) => {
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
            }
        ));

    //Проверяем если ли такой элемент в базе
    elementIsPresent(db).then((isPresent) => {
            if (isPresent) {
                //Если есть - обновляем
                return updateDocument(db);
            } else {
                //Если нет - добавляем
                return insertDocument(db);
            }
        })
        .then(() => resolve())
        .catch(function (error) {
            reject(error);
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
    }).then(() => (new Promise((resolve, reject) => {
        fs.writeFile(objFileName, data.objData.obj, function (err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    }))).then(updateManifest(`${objFileName}.manifest`))
        .then(() => {
            res.send(JSON.stringify({message: `File ${objFileName} saved`}));
        })
        .catch((error) => {
            res.send(JSON.stringify({error: error}));
        });

});


module.exports = router;
