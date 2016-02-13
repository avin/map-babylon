import Proj4js from 'proj4'

export default {

    /**
     * Конвертация градусных координат в пиксельные
     */
    degreesToPixels(lat, lng) {
        let source = new Proj4js.Proj('EPSG:4326');   //source coordinates will be in lnggitude/Latitude, WGS84
        let dest = new Proj4js.Proj('EPSG:3857');     //destination coordinates in meters, global spherical mercators projection, see http://spatialreference.org/ref/epsg/3785/

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
}