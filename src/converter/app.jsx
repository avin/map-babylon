import keys from '../common/keys';
import {get} from 'lodash';

let layers = 'buildings';
let {zoom, x, y} = {zoom: 16, x: 40117, y: 20369};
let apiKey = keys.mapzen_tiles;

fetch(`https://vector.mapzen.com/osm/${layers}/${zoom}/${x}/${y}.json?api_key=${apiKey}`)
    .then(function (response) {
        return response.json()
    })
    .then(function (data) {
        let buildings = data.features.map((feature) => {
            return {
                coordinates: _.get(feature, 'geometry.coordinates.0', []),
                properties: _.get(feature, 'properties', {})
            }
        });
        console.log(buildings);
    })
    .catch(function (ex) {
        console.log('parsing failed', ex)
    });
