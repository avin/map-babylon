import calcHelper from './helpers/calc';

export default class {

    constructor(Map) {

        this.Map = Map;
        this.playerCamera = Map.playerCamera;
        this.miniCamera = Map.miniCamera;

        this.keyCodes = {
            left: 65, //A
            right: 68, //D
            forward: 87, //W
            back: 83, //S
            up: 81, //Q
            down: 90, //Z
            shift: 16, //shift
        };

        this.keyStates = {
            left: 0,
            right: 0,
            forward: 0,
            back: 0,
            up: 0,
            down: 0,
            shift: 0,
        };

        //Возможные режимы редактирования элемента
        this.modes = {
            MOVE: 1,
            ROTATE: 2,
            DRAG: 3,
        };

        //Режим редактирования элемента
        this.mode = 1;

        //Выбранный элемент который редактируем
        this.currentElement = null;

        //Вфбранная фигура управления
        this.currentControlMesh = null;

        //Вспомогательная плоскость для перемещения и вращения
        this.supportPlane = null;

        //Координаты мыши при клик-down
        this.startingMousePoint = null;

        //Координаты мыши при клик-up
        this.endingMousePoint = null;

        //Массив фигур управления
        this.controlMeshes = [];

        this._init();
    }

    _init() {
        this.Map.scene.actionManager = new BABYLON.ActionManager(this.Map.scene);

        //Назначем состояние клавиш при нажатии
        this.Map.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
            _.each(this.keyCodes, (keyCode, eventName) => {
                if ((evt.sourceEvent.keyCode) === keyCode) {
                    this.keyStates[eventName] = 1;
                }
            });
        }));

        //Назначем состояние клавиш при отжатии
        this.Map.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            _.each(this.keyCodes, (keyCode, eventName) => {
                if ((evt.sourceEvent.keyCode) === keyCode) {
                    this.keyStates[eventName] = 0;
                }
            });
        }));

        //Переопредщеляем клавиши управления камерой
        this.playerCamera.keysDown = [this.keyCodes.back];
        this.playerCamera.keysUp = [this.keyCodes.forward];
        this.playerCamera.keysLeft = [this.keyCodes.left];
        this.playerCamera.keysRight = [this.keyCodes.right];

        this.Map.scene.registerBeforeRender(() => {

            //Привязываем положение миникарты к основной камере
            if (this.miniCamera) {
                this.miniCamera.orthoLeft = this.playerCamera.position.x - 500 / 2 * (this.miniCamera.y);
                this.miniCamera.orthoRight = this.playerCamera.position.x + 500 / 2 * (this.miniCamera.y);
                this.miniCamera.orthoTop = this.playerCamera.position.z + 500 / 2 * (this.miniCamera.x);
                this.miniCamera.orthoBottom = this.playerCamera.position.z - 500 / 2 * (this.miniCamera.x);
            }

            let cameraPositionY = this.playerCamera.position.y;

            //Только если камера в режиме управления
            if (this.Map.scene.activeCamera._attachedElement) {

                //Передвижение камеры вверх
                if (this.keyStates.up == 1) {
                    cameraPositionY += this.playerCamera.speed / 20 * this.playerCamera.accelerator;
                }

                //Передвижение камеры вниз
                if (this.keyStates.down == 1) {
                    cameraPositionY -= this.playerCamera.speed / 20 * this.playerCamera.accelerator;
                }

            }

            //Отрицательной высота не может быть - всегда метр над землей
            cameraPositionY = (cameraPositionY < 1) ? 1 : cameraPositionY;

            this.playerCamera.position.y = cameraPositionY;
        });

        this._enableClickInteractionControl()
    }

    /**
     * Активировать событя управления мышью
     * @private
     */
    _enableClickInteractionControl() {
        this.Map.canvas.addEventListener("pointerdown", this.onPointerDown.bind(this), false);
        this.Map.canvas.addEventListener("pointerup", this.onPointerUp.bind(this), false);
        this.Map.canvas.addEventListener("pointermove", this.onPointerMove.bind(this), false);

        //Отключаем стандартное контексное меню
        this.Map.canvas.addEventListener("contextmenu", (event) => {event.preventDefault()}, false);

        this.Map.scene.onDispose = () => {
            this.Map.canvas.removeEventListener("pointerdown", this.onPointerDown);
            this.Map.canvas.removeEventListener("pointerup", this.onPointerUp);
            this.Map.canvas.removeEventListener("pointermove", this.onPointerMove);
        }
    }

    onPointerDown(event) {
        switch (event.button) {
            case 0:
                this.onLeftPointerDown(event);
                break;
            case 1:
                this.onMiddlePointerDown(event);
                break;
            case 2:
                this.onRightPointerDown(event);
                break;
        }
    }

    onPointerUp(event) {
        switch (event.button) {
            case 0:
                this.onLeftPointerUp(event);
                break;
            case 1:
                this.onMiddlePointerUp(event);
                break;
            case 2:
                this.onRightPointerUp(event);
                break;
        }
    }

    onPointerMove(event) {
        let scene = this.Map.scene;
        let camera = this.Map.playerCamera;
        let currentPointOnSupportPlane;
        let diff;
        let rotationRadian;
        let startRadian;
        let initAxis;
        let pickInfo;

        //Если выбрана фигура управления
        if (this.currentControlMesh) {

            switch (this.currentControlMesh.name) {
                case 'editX':
                    currentPointOnSupportPlane = this.getPointOnSupportPlane();
                    if (currentPointOnSupportPlane) {
                        diff = currentPointOnSupportPlane.subtract(this.supportPlane.zeroPoint);
                        this.currentControlMesh.position.x += diff.x;
                        this.currentElement.mesh.setAbsolutePosition(this.currentControlMesh.position);
                        this.supportPlane.zeroPoint = currentPointOnSupportPlane;
                    }

                    break;
                case 'editY':
                    currentPointOnSupportPlane = this.getPointOnSupportPlane();
                    if (currentPointOnSupportPlane) {
                        diff = currentPointOnSupportPlane.subtract(this.supportPlane.zeroPoint);
                        this.currentControlMesh.position.y += diff.y;
                        this.currentElement.mesh.setAbsolutePosition(this.currentControlMesh.position);
                        this.supportPlane.zeroPoint = currentPointOnSupportPlane;
                    }

                    break;
                case 'editZ':
                    currentPointOnSupportPlane = this.getPointOnSupportPlane();
                    if (currentPointOnSupportPlane) {
                        diff = currentPointOnSupportPlane.subtract(this.supportPlane.zeroPoint);
                        this.currentControlMesh.position.z += diff.z;
                        this.currentElement.mesh.setAbsolutePosition(this.currentControlMesh.position);
                        this.supportPlane.zeroPoint = currentPointOnSupportPlane;
                    }

                    break;
                case 'arcXY':
                    if (this.supportPlane.startPoint) {
                        currentPointOnSupportPlane = this.getPointOnSupportPlane();

                        if (currentPointOnSupportPlane){
                            initAxis = {x: 'x', y: 'y'};
                            rotationRadian = calcHelper.getRadian(currentPointOnSupportPlane, this.supportPlane.zeroPoint, this.currentControlMesh.radius, initAxis);
                            startRadian = calcHelper.getRadian(this.supportPlane.startPoint, this.supportPlane.zeroPoint, this.currentControlMesh.radius, initAxis);

                            this.currentElement.mesh.rotation.z = this.currentElement.mesh.rotation.z + (rotationRadian - startRadian);
                            this.supportPlane.startPoint = currentPointOnSupportPlane;
                        }
                    }
                    break;
                case 'arcXZ':
                    if (this.supportPlane.startPoint) {
                        currentPointOnSupportPlane = this.getPointOnSupportPlane();

                        if (currentPointOnSupportPlane){
                            initAxis = {x: 'z', y: 'x'};
                            rotationRadian = calcHelper.getRadian(currentPointOnSupportPlane, this.supportPlane.zeroPoint, this.currentControlMesh.radius, initAxis);
                            startRadian = calcHelper.getRadian(this.supportPlane.startPoint, this.supportPlane.zeroPoint, this.currentControlMesh.radius, initAxis);

                            this.currentElement.mesh.rotation.y = this.currentElement.mesh.rotation.y + (rotationRadian - startRadian);
                            this.supportPlane.startPoint = currentPointOnSupportPlane;
                        }
                    }
                    break;
                case 'arcZY':
                    if (this.supportPlane.startPoint) {
                        currentPointOnSupportPlane = this.getPointOnSupportPlane();

                        if (currentPointOnSupportPlane){
                            initAxis = {x: 'y', y: 'z'};
                            rotationRadian = calcHelper.getRadian(currentPointOnSupportPlane, this.supportPlane.zeroPoint, this.currentControlMesh.radius, initAxis);
                            startRadian = calcHelper.getRadian(this.supportPlane.startPoint, this.supportPlane.zeroPoint, this.currentControlMesh.radius, initAxis);

                            this.currentElement.mesh.rotation.x = this.currentElement.mesh.rotation.x + (rotationRadian - startRadian);
                            this.supportPlane.startPoint = currentPointOnSupportPlane;
                        }
                    }

                    break;
                case 'dragCursor':
                    pickInfo = scene.pick(scene.pointerX, scene.pointerY, (mesh)=> {
                        //Исключаем положение самой перетаскиваемой
                        if (_.eq(mesh, this.currentElement.mesh)){
                            return false;
                        }

                        //Не берем дочерные элементы
                        if (mesh.element){
                            if (mesh.element.isChildOf(this.currentElement)){
                                return false;
                            }
                        }

                        //Только обычные элементы
                        return _.includes(this.Map.elements, mesh.element);
                    }, false, camera);

                    if (pickInfo.hit) {

                        //Назначем родителем элемента - элемент под ним
                        this.currentElement.setParent(pickInfo.pickedMesh.element);

                        //Меняем положение фигуры и контрольного элемента
                        this.currentElement.mesh.setAbsolutePosition(pickInfo.pickedPoint);
                        this.currentControlMesh.position = pickInfo.pickedPoint;

                        //Меняем вращение фигуры в зависимости от нормали фигуры на которую навели
                        let axis1 = pickInfo.getNormal();
                        let axis2 = BABYLON.Vector3.Up();
                        let axis3 = BABYLON.Vector3.Up();
                        var start = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, 0);

                        BABYLON.Vector3.CrossToRef(start, axis1, axis2);
                        BABYLON.Vector3.CrossToRef(axis2, axis1, axis3);
                        this.currentElement.mesh.rotation = BABYLON.Vector3.RotationFromAxis(axis3.negate(), axis1, axis2);

                        //TODO SubRotation
                        //mesh.subRotationQuaternion = options.pickedMeshRotationQuaternion;
                        //this.mergeRotations(mesh);
                    }
                    break;
            }
        }
    }

    onLeftPointerDown(event) {
        let scene = this.Map.scene;

        this.startingMousePoint = {x: event.clientX, y: event.clientY};

        //Проверяем если ткнули в фигуру управления
        let pickInfo = scene.pick(scene.pointerX, scene.pointerY, (mesh)=> {
            return _.includes(this.controlMeshes, mesh);
        }, false, this.Map.playerCamera);

        //Если попали
        if (pickInfo.hit) {
            //Назначаем текущую фигуру управления
            this.setCurrentControlMesh(pickInfo.pickedMesh);

            //Рисуем вспомогательные плоскости
            switch (pickInfo.pickedMesh.name) {
                case 'editX':
                    this.createSupportPlane(pickInfo.pickedMesh);
                    this.supportPlane.rotation.x = Math.PI / 2;
                    break;
                case 'editZ':
                    this.createSupportPlane(pickInfo.pickedMesh);
                    this.supportPlane.rotation.x = Math.PI / 2;
                    break;
                case 'editY':
                    this.createSupportPlane(pickInfo.pickedMesh);
                    break;
                case 'arcXY':
                    this.createSupportPlane(pickInfo.pickedMesh);
                    break;
                case 'arcXZ':
                    this.createSupportPlane(pickInfo.pickedMesh, new BABYLON.Vector3(Math.PI / 2, 0, 0));
                    break;
                case 'arcZY':
                    this.createSupportPlane(pickInfo.pickedMesh, new BABYLON.Vector3(0, Math.PI / 2, 0));
                    break;
            }
        } else {
            this.unsetCurrentControlMesh();
        }
    }

    onLeftPointerUp(event) {
        let scene = this.Map.scene;

        this.endingMousePoint = {x: event.clientX, y: event.clientY};

        if (!this.currentControlMesh) {
            //Если точка отжима такаяже как и клика - выбираем элемент под курсором
            if (_.isEqual(this.startingMousePoint, this.endingMousePoint)) {
                let pickInfo = scene.pick(scene.pointerX, scene.pointerY, (mesh)=> {

                    //Проверяем что фигура под курсором принадлежит одному из элементов
                    return _.filter(this.Map.elements, (element) => {
                        return _.eq(element.mesh, mesh)
                    });

                }, false, this.Map.playerCamera);

                //Если во что-то попали
                if (pickInfo.hit) {
                    this.setCurrentElement(pickInfo.pickedMesh.element)
                }
            }
        }

        //Убираем вспомогательную плоскость
        this.destroySupportPlane();

        this.startingSupportPlanePoint = null;

        this.unsetCurrentControlMesh();
    }

    onMiddlePointerDown(event) {
        console.log('onMiddlePointerDown')
    }

    onMiddlePointerUp(event) {
        console.log('onMiddlePointerUp')
    }


    onRightPointerDown(event) {
        console.log('onRightPointerDown')
    }

    onRightPointerUp(event) {
        event.preventDefault();
        console.log('onRightPointerUp')
    }

    /**
     * Отключить управление камеры
     */
    disableCameraControl() {
        this.Map.scene.activeCamera.detachControl(this.Map.canvas);
    }

    /**
     * Включить управление камеры
     */
    enableCameraControl() {
        this.Map.scene.activeCamera.attachControl(this.Map.canvas, false);
    }

    /**
     * Назначить текущий редактируемый элемент
     * @param element
     */
    setCurrentElement(element) {

        //Убираем все элементы управления
        this.hideControl();

        //Отключаем подсветку для всех элементов
        _.each(this.Map.elements, (element) => {
            element.disableHighlight();
        });

        //Если выбран тот же элемент - выходим
        if (_.eq(this.currentElement, element)) {
            this.currentElement = null;
            return;
        }

        this.currentElement = element;

        //Подсвечиваем активный элемент
        this.currentElement.enableHighlight(true);

        this.showControl();
    }

    /**
     * Создать вспомогательную плоскость
     * @param parentMesh
     * @param rotation
     */
    createSupportPlane(parentMesh, rotation) {
        //Если уже назначена вспомогательная плоскость - убираем старую
        if (this.supportPlane) {
            this.destroySupportPlane();
        }

        this.supportPlane = BABYLON.Mesh.CreatePlane("supportPlane", 100.0, this.Map.scene, true, BABYLON.Mesh.FRONTSIDE);

        //Настройка материала плоскости (используется для дебага)
        this.supportPlane.material = new BABYLON.StandardMaterial('mat', this.Map.scene);
        this.supportPlane.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
        this.supportPlane.material.alpha = 0.3;
        this.supportPlane.material.backFaceCulling = false;

        this.supportPlane.isVisible = false;

        //Привязываем позицию к позиции контрольной фигуры
        this.supportPlane.position = parentMesh.absolutePosition;
        if (rotation){
            this.supportPlane.rotation = rotation;
        }

        //Сохраняем "нулевую" точку на вспомогательной плоскости
        this.supportPlane.zeroPoint = parentMesh.getAbsolutePosition().clone();

        //Если было указано вращение плоскости
        if (rotation) {
            //После того как матрица вспомогательной плоскости обновится после вращения
            this.supportPlane.registerAfterWorldMatrixUpdate(() => {
                //Сохраняем координату указателя на плоскости
                this.supportPlane.startPoint = this.getPointOnSupportPlane();
            })
        } else {
            //Иначе берем координату указателя сразу
            this.supportPlane.startPoint = this.getPointOnSupportPlane();
        }

    }

    /**
     * Убрать вспомогательную плоскость
     */
    destroySupportPlane() {
        if (this.supportPlane) {
            this.supportPlane.dispose();
            this.supportPlane = null;
        }
    }

    /**
     * Получить координаты точки на вспомогательной плоскости
     * @returns {*}
     */
    getPointOnSupportPlane() {
        let scene = this.Map.scene;
        let camera = this.Map.playerCamera;

        let pickinfo = scene.pick(scene.pointerX, scene.pointerY, (mesh) => {
            return _.eq(mesh, this.supportPlane);
        }, false, camera);
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }

    /**
     * Назначить активную фигуру управления
     * @param mesh
     */
    setCurrentControlMesh(mesh) {
        //При назначеной фигуре отключаем управление камерой
        this.disableCameraControl();

        //Назначаем активную фигуру управления
        this.currentControlMesh = mesh;

        //Сохранеяем оригинальный цвет фигуры управления
        this.currentControlMesh.material.originalColor = this.currentControlMesh.material.diffuseColor.clone();

        //Делаем засветку цвета
        this.currentControlMesh.material.diffuseColor = this.currentControlMesh.material.diffuseColor.add(new BABYLON.Color3(0.5, 0.5, 0.5))
    }

    /**
     * Отменить активную фигуру управления
     */
    unsetCurrentControlMesh() {
        //Включаем обратно управление камерой
        this.enableCameraControl();

        if (this.currentControlMesh) {
            //Возвращаем оригинальный цвет активной фигуры управления
            this.currentControlMesh.material.diffuseColor = this.currentControlMesh.material.originalColor.clone();
        }

        //Обнуляем активную фигуру управления
        this.currentControlMesh = null;
    }

    /**
     * Включить элементы управления
     */
    showControl() {
        if (this.currentElement) {
            //Вешаем на элемент инструменты редактирования в зависимости от выбранного режима
            switch (this.mode) {
                case 1:
                    this.showMoveAxis();
                    break;
                case 2:
                    this.showRotateAxis();
                    break;
                case 3:
                    this.showDragCursor();
                    break;
            }
        }
    }

    /**
     * Убираем все элементы управления
     */
    hideControl() {
        _.each(this.controlMeshes, (mesh) => {
            mesh.dispose()
        });
        this.controlMeshes = [];
    }

    showControlAxises(size) {
        let scene = this.Map.scene;
        let mesh = this.currentElement.mesh;

        // X AXIS
        let axisX = BABYLON.Mesh.CreateLines("axisX", [
            new BABYLON.Vector3.Zero(),
            new BABYLON.Vector3(size, 0, 0)
        ], scene);
        axisX.position = mesh.absolutePosition;
        axisX.color = new BABYLON.Color3(1, 0, 0);

        // Y AXIS
        let axisY = BABYLON.Mesh.CreateLines("axisY", [
            new BABYLON.Vector3.Zero(),
            new BABYLON.Vector3(0, size, 0)
        ], scene);
        axisY.position = mesh.absolutePosition;
        axisY.color = new BABYLON.Color3(0, 1, 0);

        // Z AXIS
        let axisZ = BABYLON.Mesh.CreateLines("axisZ", [
            new BABYLON.Vector3.Zero(),
            new BABYLON.Vector3(0, 0, size)], scene);
        axisZ.position = mesh.absolutePosition;
        axisZ.color = new BABYLON.Color3(0, 0, 1);

        this.controlMeshes.push(axisX, axisY, axisZ)
    }

    /**
     * Отобразить оси перемещеня
     */
    showMoveAxis() {

        let mesh = this.currentElement.mesh;
        let scene = this.Map.scene;

        let size = BABYLON.Vector3.Distance(this.Map.playerCamera.position, mesh.absolutePosition) / 7;

        this.showControlAxises(size);

        let xBox = BABYLON.Mesh.CreateBox("editX", size / 10, scene);
        xBox.setPivotMatrix(BABYLON.Matrix.Translation(size, 0, 0));
        xBox.position = mesh.absolutePosition;
        let xBoxMaterial = new BABYLON.StandardMaterial("boxMaterial", scene);
        xBoxMaterial.diffuseColor = BABYLON.Color3.Red();
        xBox.material = xBoxMaterial;

        let yBox = BABYLON.Mesh.CreateBox("editY", size / 10, scene);
        yBox.setPivotMatrix(BABYLON.Matrix.Translation(0, size, 0));
        yBox.position = mesh.absolutePosition;
        let yBoxMaterial = new BABYLON.StandardMaterial("boxMaterial", scene);
        yBoxMaterial.diffuseColor = BABYLON.Color3.Green();
        yBox.material = yBoxMaterial;

        let zBox = BABYLON.Mesh.CreateBox("editZ", size / 10, scene);
        zBox.setPivotMatrix(BABYLON.Matrix.Translation(0, 0, size));
        zBox.position = mesh.absolutePosition;
        let zBoxMaterial = new BABYLON.StandardMaterial("boxMaterial", scene);
        zBoxMaterial.diffuseColor = BABYLON.Color3.Blue();
        zBox.material = zBoxMaterial;

        //Добавляем фигуры редактирования в массив объекта для последующей манипуляции с ними
        this.controlMeshes.push(xBox, yBox, zBox);
        _.each(this.controlMeshes, (mesh) => {
            mesh.renderingGroupId = 1;
        })
    };

    /**
     * Отобразить оси вращения
     */
    showRotateAxis() {

        let mesh = this.currentElement.mesh;
        let scene = this.Map.scene;

        let size = BABYLON.Vector3.Distance(this.Map.playerCamera.position, mesh.absolutePosition) / 10;

        this.showControlAxises(size);

        let curvePointsXY = (l, t) => {
            var path = [];
            for (var i = 0; i < Math.PI / 2; i += l / t) {
                path.push(new BABYLON.Vector3(size * Math.sin(i * t / 100), size * Math.cos(i * t / 100), 0));
            }
            return path;
        };

        let curvePointsXZ = (l, t) => {
            var path = [];
            for (var i = 0; i < Math.PI / 2; i += l / t) {
                path.push(new BABYLON.Vector3(size * Math.sin(i * t / 100), 0, size * Math.cos(i * t / 100)));
            }
            return path;
        };

        let curvePointsZY = (l, t) => {
            var path = [];
            for (var i = 0; i < Math.PI / 2; i += l / t) {
                path.push(new BABYLON.Vector3(0, size * Math.sin(i * t / 100), size * Math.cos(i * t / 100)));
            }
            return path;
        };

        let curveXY = curvePointsXY(1, 100);
        let curveXZ = curvePointsXZ(1, 100);
        let curveZY = curvePointsZY(1, 100);

        let radiusFunction = () => {
            return size / 10;
        };

        var arcXY = BABYLON.Mesh.CreateTube("arcXY", curveXY, 2, 60, radiusFunction, 2, scene, false, BABYLON.Mesh.FRONTSIDE);
        arcXY.position = mesh.absolutePosition;
        arcXY.material = new BABYLON.StandardMaterial('boxMaterial', scene);
        arcXY.material.diffuseColor = new BABYLON.Color3(1, 1, 0);
        arcXY.radius = radiusFunction();


        var arcXZ = BABYLON.Mesh.CreateTube("arcXZ", curveXZ, 2, 60, radiusFunction, 2, scene, false, BABYLON.Mesh.FRONTSIDE);
        arcXZ.position = mesh.absolutePosition;
        arcXZ.material = new BABYLON.StandardMaterial('boxMaterial', scene);
        arcXZ.material.diffuseColor = new BABYLON.Color3(1, 0, 1);
        arcXZ.radius = radiusFunction();

        var arcZY = BABYLON.Mesh.CreateTube("arcZY", curveZY, 2, 60, radiusFunction, 2, scene, false, BABYLON.Mesh.FRONTSIDE);
        arcZY.position = mesh.absolutePosition;
        arcZY.material = new BABYLON.StandardMaterial('boxMaterial', scene);
        arcZY.material.diffuseColor = new BABYLON.Color3(0, 1, 1);
        arcZY.radius = radiusFunction();


        //Добавляем фигуры редактирования в массив объекта для последующей манипуляции с ними
        this.controlMeshes.push(arcXY, arcXZ, arcZY);
        _.each(this.controlMeshes, (mesh) => {
            mesh.renderingGroupId = 1;
        })
    }

    /**
     * Отобразить точку для drag'n'drop элемента
     */
    showDragCursor(){
        let mesh = this.currentElement.mesh;
        let scene = this.Map.scene;

        let size = BABYLON.Vector3.Distance(this.Map.playerCamera.position, mesh.position) / 7;

        let dragCursor = BABYLON.Mesh.CreateSphere("dragCursor", 5, size / 5, scene);
        dragCursor.position = mesh.absolutePosition;
        let dragCursorMaterial = new BABYLON.StandardMaterial("dragCursorMaterial", scene);
        dragCursorMaterial.diffuseColor = BABYLON.Color3.Red();
        dragCursorMaterial.alpha = 0.6;
        dragCursor.material = dragCursorMaterial;

        //Добавляем фигуры редактирования в массив объекта для последующей манипуляции с ними
        this.controlMeshes.push(dragCursor);
        _.each(this.controlMeshes, (mesh) => {
            mesh.renderingGroupId = 1;
        })
    }

    setMode(mode) {
        this.mode = mode;

        //Переделываем элементы управления
        this.hideControl();
        this.showControl();
    }

    update() {

    }


}