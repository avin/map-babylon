import Renderer from './renderer/Renderer'
import Catalog from './ui/catalog/Catalog'
import ModeButtons from './ui/modeButtons/ModeButtons'
import TypeEditorControl from './ui/typeEditorControl/TypeEditorControl'

let app = global.app = {};

$( document ).ready(function() {
    app.renderer = new Renderer('map-canvas');
    app.ui = {
        catalog: new Catalog('catalog'),
        modeButtons: new ModeButtons('mode-buttons'),
        typeEditorControl: new TypeEditorControl('type-editor-control')
    };

    app.renderer.setActiveScene('map');
});