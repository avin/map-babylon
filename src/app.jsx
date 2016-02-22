import Renderer from './renderer/Renderer'
import Catalog from './ui/catalog/Catalog'
import ModeButtons from './ui/modeButtons/ModeButtons'

let app = global.app = {};

$( document ).ready(function() {
    app.renderer = new Renderer('map-canvas');
    app.ui = {
        catalog: new Catalog('catalog'),
        modeButtons: new ModeButtons('mode-buttons')
    };
});