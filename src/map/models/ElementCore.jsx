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
        let typeStyleColor = _.get(this.Element.getType(), 'style.color', '#FFFFFF');

        mesh.material.diffuseColor = colorHelper.hexColorToBabylonColor3(typeStyleColor);
        mesh.material.specularColor = new BABYLON.Color4(0.3, 0.3, 0.3, 0.5);
        mesh.material.useGlossinessFromSpecularMapAlpha = true;

    }

    /**
     * Покадровое обновление элемента
     */
    update() {
        //
    }
}