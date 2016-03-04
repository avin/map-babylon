import keys from '../common/keys';
import {get} from 'lodash';
import sanitizeHtml from 'sanitize-html';
import Scene from './scene.jsx';
import Renderer from './renderer.jsx';

let layers = 'buildings';
let {zoom, minX, minY} = {zoom: 16, minX: 40117, minY: 20369};
let {maxX, maxY} = {maxX: 40125, maxY: 20372};

let apiKey = keys.mapzen_tiles;

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
    fetch(`https://vector.mapzen.com/osm/${layers}/${zoom}/${x}/${y}.json?api_key=${apiKey}`)
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {

            //Преобразуем полученные данные
            let buildings = data.features.map((feature) => {
                return {
                    coordinates: _.get(feature, 'geometry.coordinates.0', []),
                    properties: _.get(feature, 'properties', {})
                }
            });

            buildings.forEach((building) => {

                //Создаем obj для строения
                let objData = scene.generateBuildingObjData(building.coordinates, _.get(building.properties, 'levels', 1));
                building.objData = objData;

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
                }).then((response) => {

                    //Парсим полученные json данные
                    return response.json()

                }).then((response) => {

                    //Выводим результат
                    if (response.message) {
                        resultsElement.innerHTML = resultsElement.innerHTML + `<span class="text-success">${sanitizeHtml(response.message)}</span><br>`;
                    } else {
                        resultsElement.innerHTML = resultsElement.innerHTML + `<span class="text-danger">${sanitizeHtml(response.error)}</span><br>`;
                    }

                    //Автоскрол результатов
                    resultsElement.scrollTop = resultsElement.scrollHeight;

                    //Обновляем прогрессбар

                    currentTile++;

                    if (currentTile < tiles.length) {

                        parseTile(tiles[currentTile].x, tiles[currentTile].y);
                        let progress = currentTile / (tiles.length - 1) * 100;
                        console.log(currentTile, tiles.length, progress);

                        $('.progress-bar').css('width', progress + '%').attr('aria-valuenow', progress);
                    }

                }).catch(function (err) {
                    console.log('fetch converter/save error', err)
                });
            });

        })
        .catch(function (err) {
            console.log('parsing failed', err)
        });
};

parseTile(tiles[currentTile].x, tiles[currentTile].y);
