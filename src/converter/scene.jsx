import {coordinateConverter} from '../common/helpers';

export default class extends BABYLON.Scene {

    constructor(engine) {
        super(engine);
    }

    /**
     * Получить obj фигуры строения по координатам и высоте
     * @param coordinates
     * @param height
     */
    generateBuildingObjData(coordinates, height = 3) {

        let buildingStartPoint = coordinateConverter.degreesToPixels(coordinates[0][1], coordinates[0][0]);

        //Считаем высоту строения по этажам
        let min_height = 0; //3 метра подвал

        let shape = [];
        for (let i = 0; i < coordinates.length; i++) {
            let pixelcoordinates = coordinateConverter.degreesToPixels(coordinates[i][1], coordinates[i][0]);
            shape.push(new BABYLON.Vector2(pixelcoordinates.x - buildingStartPoint.x, pixelcoordinates.y - buildingStartPoint.y));
        }

        //Отчет точек против часовой стрелки для нормального выставления нормалей стенок
        shape = _.reverse(shape);

        //Примечание: 3 метра на подвал!
        let mesh = new BABYLON.PolygonMeshBuilder("building", shape, this).build(1, height + 3);

        //Поднимаем высоту внутренних точек фигуры на высоту строения
        var updatePositions = function (positions) {
            for (var idx = 0; idx < positions.length; idx += 3) {
                positions[idx + 1] += height;
            }
        };
        mesh.updateMeshPositions(updatePositions);
        mesh.refreshBoundingInfo();

        let obj = BABYLON.OBJExport.OBJ(mesh, false);

        mesh.dispose();

        return {
            obj,
            position: {x: buildingStartPoint.x, z: buildingStartPoint.y, y: 0},
        };
    }
}
