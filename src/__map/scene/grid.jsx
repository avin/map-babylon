export default {

    create(scene, options = {}){

        let position = options.position || new BABYLON.Vector3(0, 0, 0);
        let i;
        let line;

        for (i = -40; i <= 40; i += 1) {
            line = BABYLON.Mesh.CreateLines('line', [
                new BABYLON.Vector3(-40 + position.x, position.y, i + position.z),
                new BABYLON.Vector3(40 + position.x, position.y, i + position.z),
            ], scene);
            if ((i % 5) !== 0) {
                line.color = new BABYLON.Color3(0.5, 0.5, 0.5);
            }
            line.alpha = 0.5;

            line = BABYLON.Mesh.CreateLines('line', [
                new BABYLON.Vector3(i + position.x, position.y, -40 + position.z),
                new BABYLON.Vector3(i + position.x, position.y, 40 + position.z),
            ], scene);

            if ((i % 5) !== 0) {
                line.color = new BABYLON.Color3(0.5 + position.x, 0.5 + position.y, 0.5 + position.z);
            }
            line.alpha = 0.5;

            // Вертикальная сетка только с градацией высоты
            line = BABYLON.Mesh.CreateLines('line', [
                new BABYLON.Vector3(0 + position.x, i + position.y, -40 + position.z),
                new BABYLON.Vector3(0 + position.x, i + position.y, 40 + position.z),
            ], scene);
            if ((i % 5) !== 0) {
                line.color = new BABYLON.Color3(0.5, 0.5, 0.5);
            }
            line.alpha = 0.5;
        }

    }


}