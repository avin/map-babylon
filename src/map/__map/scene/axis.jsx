export default {

    create(Map, options = {}){

        let size = options.size || 10;
        let position = options.position || new BABYLON.Vector3(0,0,0);
        let scene = Map.scene;

        let makeTextPlane = function (text, color, size, scene) {
            let dynamicTexture = new BABYLON.DynamicTexture('DynamicTexture', 50, scene, true);
            dynamicTexture.hasAlpha = true;
            dynamicTexture.drawText(text, 5, 40, 'bold 36px Arial', color, 'transparent', true);
            let plane = BABYLON.Mesh.CreatePlane('TextPlane', size, scene, true);
            plane.material = new BABYLON.StandardMaterial('TextPlaneMaterial', scene);
            plane.material.backFaceCulling = false;
            plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
            plane.material.diffuseTexture = dynamicTexture;
            return plane;
        };

        let axisX = BABYLON.Mesh.CreateLines('axisX', [
            position, new BABYLON.Vector3(position.x + size, position.y + 0, position.z), new BABYLON.Vector3(position.x + size * 0.95, position.y + 0.05 * size, position.z),
            new BABYLON.Vector3(position.x + size, position.y + 0, position.z), new BABYLON.Vector3(position.x + size * 0.95, position.y + (-0.05 * size), position.z)
        ], scene);
        axisX.color = new BABYLON.Color3(1, 0, 0);
        let xChar = makeTextPlane('X', 'red', size / 10, scene);
        xChar.position = new BABYLON.Vector3(position.x + 0.9 * size, position.y + (-0.05 * size), position.z);
        let axisY = BABYLON.Mesh.CreateLines('axisY', [
            position, new BABYLON.Vector3(position.x + 0, position.y + size, position.z), new BABYLON.Vector3(position.x + (-0.05 * size), position.y + size * 0.95, position.z),
            new BABYLON.Vector3(position.x + 0, position.y + size, position.z), new BABYLON.Vector3(position.x + 0.05 * size, position.y + size * 0.95, position.z)
        ], scene);
        axisY.color = new BABYLON.Color3(0, 1, 0);
        let yChar = makeTextPlane('Y', 'green', size / 10, scene);
        yChar.position = new BABYLON.Vector3(position.x + 0, position.y + 0.9 * size, position.z + (-0.05 * size));
        let axisZ = BABYLON.Mesh.CreateLines('axisZ', [
            position, new BABYLON.Vector3(position.x + 0, position.y + 0, position.z + size), new BABYLON.Vector3(position.x + 0, position.y + (-0.05 * size), position.z + size * 0.95),
            new BABYLON.Vector3(position.x + 0, position.y + 0, position.z + size), new BABYLON.Vector3(position.x + 0, position.y + 0.05 * size, position.z + size * 0.95)
        ], scene);
        axisZ.color = new BABYLON.Color3(0, 0, 1);
        let zChar = makeTextPlane('Z', 'blue', size / 10, scene);
        zChar.position = new BABYLON.Vector3(position.x + 0, position.y + 0.05 * size, position.z + 0.9 * size);

    }


}