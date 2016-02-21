import AbstractElement from '../AbstractElement';
import CoordinateHelpers from '../../Helpers/coordinate';

export default class extends AbstractElement {

    constructor(Map, elementData, options = {}) {
        super(Map, elementData);

        this.options = {};
        this.options.style = options.style || 'tiled';

        //Субколор для подкрашивания совместимости монтирования тайловой поверхности
        this.subColor = null;

        this._init();
    }

    _init() {
        switch (this.options.style) {
            case 'simple' :
                this.createSimpleGround();
                break;
            case 'tiled' :
                this.createTileGround();
                break;
            default:
                //Если иначе - значит купола нет (выходим)
                return false;
        }

        super._init();
    }

    /**
     * Создать простой граунд
     */
    createSimpleGround() {
        if (this.mesh){
            this.mesh.dispose();
        }

        let drawDistance = 1000;

        // Создаем объект
        this.mesh = new BABYLON.Mesh.CreateGround("ground", drawDistance, drawDistance, 50, this.Map.scene);

        this.setMaterial(this.subColor);
    }

    /**
     * Создать граунд с тайловой текстурой
     */
    createTileGround() {

        if(this.mesh){
            this.mesh.dispose(true);
        }

        //Зум для выборки тайлов
        let zoom = 19;

        let cameraPosition = this.Map.playerCamera.position;
        let cameraGeoPosition = CoordinateHelpers.pixelsToDegrees(cameraPosition.x, cameraPosition.z);
        let tileUnderCameraData = CoordinateHelpers.gpsToTileCoords(cameraGeoPosition.lat, cameraGeoPosition.lng, zoom);

        this.currentTileUnderCameraData = tileUnderCameraData;

        let tiles = {
            xMin: tileUnderCameraData.x - 5,
            xMax: tileUnderCameraData.x + 5,
            yMin: tileUnderCameraData.y + 5,
            yMax: tileUnderCameraData.y - 5,
        };

        let minTileGeoData = CoordinateHelpers.tileCoordsToGps(tiles.xMin, tiles.yMin + 1, zoom);
        let maxTileGeoData = CoordinateHelpers.tileCoordsToGps(tiles.xMax + 1, tiles.yMax, zoom);

        let minTilePixelData = CoordinateHelpers.degreesToPixels(minTileGeoData.lat, minTileGeoData.lng);
        let maxTilePixelData = CoordinateHelpers.degreesToPixels(maxTileGeoData.lat, maxTileGeoData.lng);

        let xmin = minTilePixelData.x;
        let zmin = minTilePixelData.y;
        let xmax = maxTilePixelData.x;
        let zmax = maxTilePixelData.y;

        let precision = {
            "w": 1,
            "h": 1
        };

        let subdivisions = {
            'h': 11,
            'w': 11
        };

        this.mesh = new BABYLON.Mesh.CreateTiledGround("ground", xmin, zmin, xmax, zmax, subdivisions, precision, this.Map.scene);

        //Создаем мультиматериала
        let multimat = new BABYLON.MultiMaterial("multi", this.Map.scene);

        //Создаем тайловый материал
        let xTileBase = tiles.xMin;
        let yTileBase = tiles.yMin;
        for (let row = 0; row < subdivisions.h; row++) {
            for (let col = 0; col < subdivisions.w; col++) {
                let material = new BABYLON.StandardMaterial(
                    "material" + row + "-" + col,
                    this.Map.scene
                );
                material.diffuseTexture = new BABYLON.Texture(
                    //`http://tiles.el.vladinfo.ru/mapnik/z${zoom}/${yTileBase - row}/${xTileBase + col}.png`,
                    `http://a.tile.openstreetmap.org/${zoom}/${xTileBase + col}/${yTileBase - row}.png`,
                    //`http://a.tile.stamen.com/toner/${zoom}/${xTileBase + col}/${yTileBase - row}.png`,
                    this.Map.scene
                );
                material.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
                material.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
                material.specularColor = new BABYLON.Color4(0.2, 0.2, 0.2, 1);
                if (this.subColor){
                    material.diffuseColor = this.subColor;
                }

                material.backFaceCulling = false;
                multimat.subMaterials.push(material);
            }
        }

        //Применяем мультиматериал
        this.mesh.material = multimat;

        //Высчитываем переменные для построения нужного порядка тайловых кусков
        let verticesCount = this.mesh.getTotalVertices();
        let tileIndicesLength = this.mesh.getIndices().length / (subdivisions.w * subdivisions.h);

        //Выставляет тайловые куски в нужном порядке
        this.mesh.subMeshes = [];
        let index = 0;
        let base = 0;
        for (let row = 0; row < subdivisions.h; row++) {
            for (let col = 0; col < subdivisions.w; col++) {
                let submesh = new BABYLON.SubMesh(
                    index++, 0, verticesCount, base, tileIndicesLength, this.mesh
                );
                this.mesh.subMeshes.push(submesh);
                base += tileIndicesLength;
            }
        }

        this.mesh.element = this;
        this.setVisibility(this.visibility);
    }

    /**
     * Создать граунд с сетчатой текстурой
     */
    createGridGround() {
        //TODO
    }

    /**
     * Выставить нормальный режим отображения для элемента
     */
    setVisibilityNormal() {
        super.setVisibilityNormal();

        this.mesh.visibility = 1;
        this.setMaterialAlpha(1);
    }

    /**
     * Выставить прозрачный режим отображения для элемента
     */
    setVisibilityTransparent() {
        super.setVisibilityTransparent();

        this.mesh.visibility = 1;
        this.setMaterialAlpha(0.3);
    }

    /**
     * Выставить скрытый режим отображения для элемента
     */
    setVisibilityHidden() {
        super.setVisibilityHidden();

        this.mesh.visibility = 0;
        this.setMaterialAlpha(1);
    }

    setMaterialAlpha(alpha){
        switch (this.options.style) {
            case 'simple':
            {
                this.mesh.material.alpha = alpha;
                break;
            }
            case 'tiled':
            {
                _.each(this.mesh.material.subMaterials, (subMaterial) => {
                    subMaterial.alpha = alpha;
                });
                break;
            }
        }
    }

    /**
     * Подкрасить как совместимый для монтирования
     */
    colorMountCompatible(){
        this.subColor = new BABYLON.Color3.Green();
        this._init();
    }

    /**
     * Подкрасить как несовместимый для монтирования
     */
    colorMountIncompatible(){
        this.subColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        this._init();
    }

    /**
     * Убрать подкрашивание
     */
    unColor(){
        this.subColor = null;
        this._init();
    }

    /**
     * Покадровое обновление элемента
     */
    update() {
        switch (this.options.style) {
            case 'simple':
            {
                if (this.mesh) {
                    //Двигаем землю вместе с камерой
                    this.mesh.position.x = this.Map.scene.activeCamera.position.x;
                    this.mesh.position.z = this.Map.scene.activeCamera.position.z
                }
                break;
            }
            case 'tiled':
            {
                let zoom = 19;
                let cameraPosition = this.Map.playerCamera.position;
                let cameraGeoPosition = CoordinateHelpers.pixelsToDegrees(cameraPosition.x, cameraPosition.z);
                let tileUnderCameraData = CoordinateHelpers.gpsToTileCoords(cameraGeoPosition.lat, cameraGeoPosition.lng, zoom);

                if (!_.isEqual(this.currentTileUnderCameraData, tileUnderCameraData)){
                    this.createTileGround();
                    console.log('update tile map', tileUnderCameraData);
                }

                break;
            }
        }
    }
}