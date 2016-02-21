import Renderer from './renderer/Renderer'
import Catalog from './catalog/Catalog'
import MapUiBox from './uiBoxes/map/MapUiBox'

let app = global.app = {};

$( document ).ready(function() {
    app.renderer = new Renderer('map-canvas');
    app.catalog = new Catalog('catalog');
    app.mapUiBox = new MapUiBox('map-ui-box');
});