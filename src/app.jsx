import Map from './map/Map'
import Catalog from './catalog/Catalog'
import UiBox from './ui-box/UiBox'

let app = global.app = {};

$( document ).ready(function() {
    app.map = new Map('map-canvas');
    app.catalog = new Catalog('catalog');
    app.uiBox = new UiBox('ui-box');
});