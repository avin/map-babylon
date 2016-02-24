import Proj4js from 'proj4'

/**
 * Геометрические расчеты
 *
 */
export const calc = {
    /**
     * Получение радианы
     * @param point
     * @param center
     * @param radius
     * @param initAxis
     * @returns {number}
     */
    getRadian(point, center, radius, initAxis) {
        let cX = center[initAxis.x];
        let cY = center[initAxis.y];

        let vX = (point[initAxis.x] - cX);
        let vY = (point[initAxis.y] - cY);
        let magV = Math.sqrt(vX * vX + vY * vY);
        let aX = cX + vX / magV * radius;
        let aY = cY + vY / magV * radius;

        return Math.atan2(aY - cY, aX - cX);
    }
};

/**
 * Работа с цветом
 *
 */
export const color = {
    /**
     * Конвертация hex-строки цвета в формат Бабилона
     * @param hex
     * @returns {BABYLON.Color3.FromInts}
     */
    hexColorToBabylonColor3(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        let color = result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;

        if (color) {
            return new BABYLON.Color3.FromInts(color.r, color.g, color.b)
        } else {
            return new BABYLON.Color3(0.1, 0.1, 0.1)
        }
    }
};

/**
 * Функции для преобразования координат
 *
 */
export const coordinateConverter = {

    /**
     * Конвертация градусных координат в пиксельные
     */
    degreesToPixels(lat, lng) {
        let source = new Proj4js.Proj('EPSG:4326');   //source coordinates will be in lnggitude/Latitude, WGS84
        let dest = new Proj4js.Proj('EPSG:3857');     //destination coordinates in meters, global spherical mercators
                                                      // projection, see http://spatialreference.org/ref/epsg/3785/

        // transforming point coordinates
        let p = new Proj4js.toPoint([lng, lat]);   //any object will do as lngg as it has 'x' and 'y' properties
        Proj4js.transform(source, dest, p);      //do the transformation.  x and y are modified in place
        //p.x and p.y are now EPSG:3785 in meters

        return {
            x: p.x - 4493378,
            y: p.y - 7579693,
        };
    },

    /**
     * Конвертация пиксельных координат в градусные
     */
    pixelsToDegrees(x, y) {
        x = x + 4493378;
        y = y + 7579693;

        let source = new Proj4js.Proj('EPSG:3857');
        let dest = new Proj4js.Proj('EPSG:4326');

        // transforming point coordinates
        let p = new Proj4js.toPoint([x, y]);
        Proj4js.transform(source, dest, p);

        return {
            lng: p.x,
            lat: p.y,
        };
    },

    /**
     * Конвертация градусных координат в тайловые
     * @param lat
     * @param lng
     * @param zoom
     * @returns {{x: number, y: number}}
     */
    gpsToTileCoords(lat, lng, zoom) {
        if (!zoom) {
            zoom = 16;
        }

        let x = (Math.floor((lng + 180) / 360 * Math.pow(2, zoom)));
        let y = (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));

        return {x: x, y: y};
    },

    /**
     * Конвертация тайловых координат в градусные
     * @param x
     * @param y
     * @param zoom
     * @returns {{lat: number, lng: number}}
     */
    tileCoordsToGps(x, y, zoom) {
        if (!zoom) {
            zoom = 16;
        }

        let lng = (x / Math.pow(2, zoom) * 360 - 180);

        let n = Math.PI - 2 * Math.PI * y / Math.pow(2, zoom);
        let lat = (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));

        return {lat: lat, lng: lng};
    },
};