import {coordinateConverter} from '../common/helpers';

export default class extends BABYLON.Scene {

    constructor(engine) {
        super(engine);
    }

    /**
     * Получить obj фигуры строения по координатам и высоте
     * @param coordinates
     * @param levels
     */
    generateBuildingObjData(coordinates, levels = 1) {

        let buildingStartPoint = coordinateConverter.degreesToPixels(coordinates[0][1], coordinates[0][0]);

        //Считаем высоту строения по этажам
        let height = levels * 3; //3 метра на этаж
        let min_height = -3; //3 метра подвал

        let shape = [];
        for (let i = 0; i < coordinates.length; i++) {
            let pixelcoordinates = coordinateConverter.degreesToPixels(coordinates[i][1], coordinates[i][0]);
            shape.push(new BABYLON.Vector2(pixelcoordinates.x - buildingStartPoint.x, pixelcoordinates.y - buildingStartPoint.y));
        }

        let mesh = new BABYLON.PolygonMeshBuilder("building", shape, this).build(1, height);

        //Поднимаем высоту внутренних точек фигуры на высоту строения
        var updatePositions = function (positions) {
            for (var idx = 0; idx < positions.length; idx += 3) {
                positions[idx + 1] += height;
            }
        };
        mesh.updateMeshPositions(updatePositions);
        mesh.refreshBoundingInfo();

        return {
            position: buildingStartPoint,
            obj:BABYLON.OBJExport.OBJ(mesh, false)
        }
    }
}
