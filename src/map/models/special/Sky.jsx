import ElementCore from '../ElementCore';

export default class extends ElementCore {

    constructor(Element, options = {}) {
        super(Element);

        this.options = {};
        this.options.style = options.style || 'box';
        this.options.distance = options.distance || 1000;
        this.options.texture = options.texture || 'desert';

        this._init()
    }

    _init() {
        switch (this.options.style) {
            case 'sphere' :
                this.createSphereSkybox();
                break;
            case 'box' :
                this.createBoxSkybox();
                break;
            default:
                //Если иначе - значит купола нет (выходим)
                return false;
        }

        //Данная фигура не будет отображаться на миникарте
        if (this.Element.mesh) {
            //Сферу не будет видно на миникарте
            this.Element.mesh.layerMask = 2;
        }
    }

    /**
     * Создать купольное небо
     */
    createSphereSkybox() {
        this.Element.mesh = BABYLON.Mesh.CreateSphere("skyBox", 100, this.options.distance, this.Map.scene);

        this.setMaterial();
    }

    setMaterial(){
        this.Element.mesh.material = this.createGradientMaterial();
    }

    /**
     * Создать коробочное небо
     */
    createBoxSkybox() {
        this.Element.mesh = BABYLON.Mesh.CreateBox("skyBox", this.options.distance, this.Map.scene);
        this.Element.mesh.material = this.createTexturedMaterial();
    }

    /**
     * Создать градиентный материал для сферы
     */
    createGradientMaterial() {
        let material = new BABYLON.ShaderMaterial("gradient", this.Map.scene, "/assets//shaders/gradient", {});
        material.setFloat("offset", 10);
        material.setColor3("topColor", BABYLON.Color3.FromInts(0, 119, 255));
        material.setColor3("bottomColor", BABYLON.Color3.FromInts(240, 240, 255));
        material.backFaceCulling = false;
        return material;
    }

    /**
     * Создать текстурированный материал для коробки
     */
    createTexturedMaterial() {
        let material = new BABYLON.StandardMaterial("skyBox", this.Map.scene);
        material.backFaceCulling = false;
        material.reflectionTexture = new BABYLON.CubeTexture(`/assets/textures/${this.options.texture}`, this.Map.scene);
        material.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        material.diffuseColor = new BABYLON.Color3(0, 0, 0);
        material.specularColor = new BABYLON.Color3(0, 0, 0);
        material.disableLighting = true;

        return material;
    }

    /**
     * Выставить нормальный режим отображения для элемента
     */
    setVisibilityNormal(){
        super.setVisibilityNormal();

        this.Element.mesh.visibility = 1;
        this.Element.mesh.material = this.createTexturedMaterial();
    }

    /**
     * Выставить прозрачный режим отображения для элемента
     */
    setVisibilityTransparent(){
        super.setVisibilityTransparent();

        this.Element.mesh.visibility = 1;
        this.Element.mesh.material = this.createGradientMaterial();
    }

    /**
     * Выставить скрытый режим отображения для элемента
     */
    setVisibilityHidden(){
        super.setVisibilityHidden();

        this.Element.mesh.visibility = 0;
    }

    /**
     * Покадровое обновление элемента
     */
    update() {
        if (this.Element.mesh) {
            //Двигаем небо вместе с камерой
            this.Element.mesh.position.x = this.Map.scene.activeCamera.position.x;
            this.Element.mesh.position.z = this.Map.scene.activeCamera.position.z
        }
    }
}