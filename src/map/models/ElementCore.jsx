import {VISIBILITY} from '../../constants'
import colorHelper from '../Helpers/color'

export default class {

    constructor(Element) {
        this.Element = Element;
        this.Map = Element.Map;
    }

    setMaterial() {
        let mesh = this.Element.mesh.sourceMesh ? this.Element.mesh.sourceMesh : this.Element.mesh;

        mesh.material = new BABYLON.StandardMaterial('material', this.Map.scene);
        mesh.material.glossiness = 0.2;
        let typeStyleColor = colorHelper.hexColorToBabylonColor3(_.get(this.Element.getType(), 'style.color', '#FFFFFF'));

        mesh.material.diffuseColor = typeStyleColor;
        mesh.material.specularColor = new BABYLON.Color4(0.3, 0.3, 0.3, 0.5);
        mesh.material.useGlossinessFromSpecularMapAlpha = true;

        return typeStyleColor;
    }

    /**
     * Выставить нормальный режим отображения для элемента
     */
    setVisibilityNormal(){
        this.Element.visibility = VISIBILITY.NORMAL;
    }

    /**
     * Выставить прозрачный режим отображения для элемента
     */
    setVisibilityTransparent(){
        this.Element.visibility = VISIBILITY.TRANSPARENT;
    }

    /**
     * Выставить скрытый режим отображения для элемента
     */
    setVisibilityHidden(){
        this.Element.visibility = VISIBILITY.HIDDEN;
    }

    /**
     * Покадровое обновление элемента
     */
    update() {
        //
    }
}