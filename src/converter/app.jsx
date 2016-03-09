import keys from '../common/keys';
import {get} from 'lodash';
import sanitizeHtml from 'sanitize-html';
import Scene from './scene.jsx';
import Renderer from './renderer.jsx';

let layers = 'buildings';
let zoom = 16;
//let minX = 40106;
let minX = 40111;
//let maxX = 40144;
let maxX = 40121;
//let minY = 20348;
let minY = 20367;
//let maxY = 20378;
let maxY = 20375;
let apiKey = keys.mapzen_tiles;
let id = 1;

let renderer = new Renderer('converter-canvas');
let scene = new Scene(renderer.engine);

let resultsElement = document.getElementById('results');

let tiles = [];
for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
        tiles.push({x, y});
    }
}
let currentTile = 0;

/**
 * Получаем данные о строениях для заданного тайла
 */
let parseTile = (x, y) => {
    setTimeout(() => {
        fetch(`https://vector.mapzen.com/osm/${layers}/${zoom}/${x}/${y}.json?api_key=${apiKey}`)
            .then((response) => response.json())
            .then((data) => new Promise((resolve, reject) => {

                //Преобразуем полученные данные
                let buildings = [];
                _.each(data.features, (feature) => {
                    if (_.get(feature, 'geometry.type') === "Polygon") {
                        buildings.push({
                            coordinates: _.get(feature, 'geometry.coordinates.0', []),
                            properties: _.get(feature, 'properties', {}),
                            id: id++,
                        })
                    }
                });

                let buildingsSaved = 0;

                //Если строений нет - переходим к другому тайлу
                if (_.isEmpty(buildings)) {
                    resolve();
                }

                buildings.forEach((building) => {

                    //Создаем obj для строения
                    building.objData = scene.generateBuildingObjData(building.coordinates, _.get(building.properties, 'height', 3));

                    //Сохраняем данные на сервере
                    fetch('/converter/save', {
                        method: 'post',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            building: building,
                        })
                    }).then((response) => response.json())
                        .then((response) => {

                            //Выводим результат
                            //if (response.message) {
                            //    resultsElement.innerHTML = resultsElement.innerHTML + `<span
                            // class="text-success">${sanitizeHtml(response.message)}</span><br>`; } else {
                            // resultsElement.innerHTML = resultsElement.innerHTML + `<span
                            // class="text-danger">${sanitizeHtml(response.error)}</span><br>`; }

                            //Автоскрол результатов
                            resultsElement.scrollTop = resultsElement.scrollHeight;

                            buildingsSaved++;

                            //Если сохранили все элементы - переходим к другому тайлу
                            if (buildingsSaved === buildings.length) {
                                resolve();
                            }

                        })
                        .catch((err) => {
                            console.log('fetch converter/save error', err)
                        });
                });

            })
                .then(() => {
                    currentTile++;
                    if (currentTile < tiles.length) {
                        parseTile(tiles[currentTile].x, tiles[currentTile].y);
                    }

                    //Обновляем прогрессбар
                    let progress = currentTile / (tiles.length - 1) * 100;
                    $('.progress-bar').css('width', progress + '%').attr('aria-valuenow', progress);
                })
                .catch((err) => {
                    console.log('parsing failed', err)
                }));
    });
};

parseTile(tiles[currentTile].x, tiles[currentTile].y);
