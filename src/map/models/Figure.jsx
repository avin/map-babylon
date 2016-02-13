export default class {

    highlight(){
        // custom outline
        var red = new BABYLON.StandardMaterial('red', scene);
        red.emissiveColor = new BABYLON.Color3(1, 0, 0);
        red.diffuseColor = new BABYLON.Color3(1, 0, 0);

        var cylinder2 = BABYLON.Mesh.CreateCylinder("cylinder", 5, 4, 4, 6, 3, scene);
        cylinder2.position.y = 1;
        cylinder2.position.x = 10;
        cylinder2.position.z = 5;
        cylinder2.customOutline = BABYLON.Mesh.CreateCylinder("cylinder", 5, 4, 4, 6, 3, scene, false, BABYLON.Mesh.BACKSIDE);
        cylinder2.customOutline.scaling = new BABYLON.Vector3(1.05, 1.05, 1.05);
        cylinder2.customOutline.parent = cylinder2;
        cylinder2.customOutline.material = red;
    }

}