import {calc} from '../../../common/helpers';
import modeButtonsActions from '../../ui/modeButtons/actions/actions'
import {VISIBILITY, KEY_CODES, CONTROL_MODES} from '../../constants';

export default class {

    constructor(scene) {

        this.scene = scene;
        this.playerCamera = scene.playerCamera;
        this.miniCamera = scene.miniCamera;

        //Состаяния нажатых клавиш
        this.keyStates = {
            left: 0,
            right: 0,
            forward: 0,
            back: 0,
            up: 0,
            down: 0,
            shift: 0,
            delete: 0,
        };

        //Режим редактирования элемента
        this.setMode(CONTROL_MODES.DRAG);

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

        //ID undo-действия в стеке отмены действий
        this.undoItemId = null;

        this._init();
    }

    _init() {
        //Вешаем стандартный обработчик событий бабилона на сцену
        this.scene.actionManager = new BABYLON.ActionManager(this.scene);

        //Назначем состояние клавиш при нажатии
        this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
            _.each(KEY_CODES, (keyCode, eventName) => {
                if ((evt.sourceEvent.keyCode) === keyCode) {
                    this.keyStates[eventName] = 1;
                }
            });
        }));

        //Назначем состояние клавиш при отжатии
        this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            _.each(KEY_CODES, (keyCode, eventName) => {
                if ((evt.sourceEvent.keyCode) === keyCode) {
                    this.keyStates[eventName] = 0;
                }
            });
        }));

        //Переопределяем клавиши управления камерой
        this.playerCamera.keysDown = [KEY_CODES.back];
        this.playerCamera.keysUp = [KEY_CODES.forward];
        this.playerCamera.keysLeft = [KEY_CODES.left];
        this.playerCamera.keysRight = [KEY_CODES.right];

        //Дейсвтие до рендера кадра
        this.scene.registerBeforeRender(() => {

            //Привязываем положение миникарты к основной камере
            if (this.miniCamera) {
                this.miniCamera.orthoLeft = this.playerCamera.position.x - 500 / 2 * (this.miniCamera.y);
                this.miniCamera.orthoRight = this.playerCamera.position.x + 500 / 2 * (this.miniCamera.y);
                this.miniCamera.orthoTop = this.playerCamera.position.z + 500 / 2 * (this.miniCamera.x);
                this.miniCamera.orthoBottom = this.playerCamera.position.z - 500 / 2 * (this.miniCamera.x);
            }

            /**
             * Управление высотой камеры
             */

            let cameraPositionY = this.playerCamera.position.y;

            //Только если камера в режиме управления
            if (this.scene.playerCamera._attachedElement) {

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
            this.playerCamera.position.y = (cameraPositionY < 1) ? 1 : cameraPositionY;

            /**
             * Прочие обработчики нажатия клавиш
             */

            //Только если камера в режиме управления
            if (this.scene.playerCamera._attachedElement) {
                //Удаляем элемент
                if (this.keyStates.delete) {
                    this.deleteElement();
                }
            }
        });

        this._enableClickInteractionControl()
    }

    /**
     * Активировать событя управления мышью
     * @private
     */
    _enableClickInteractionControl() {

        //Отключаем стандартное контексное меню
        this.scene.getEngine().getRenderingCanvas().addEventListener('contextmenu', (event) => {
            event.preventDefault()
        }, false);

        //Обработчики событий мыши
        this.scene.getEngine().getRenderingCanvas().addEventListener('pointerdown', this.onPointerDown.bind(this), false);
        this.scene.getEngine().getRenderingCanvas().addEventListener('pointerup', this.onPointerUp.bind(this), false);
        this.scene.getEngine().getRenderingCanvas().addEventListener('pointermove', this.onPointerMove.bind(this), false);

        //Снимаем обработчики при удалении сцены
        this.scene.onDispose = () => {
            this.scene.getEngine().getRenderingCanvas().removeEventListener('pointerdown', this.onPointerDown);
            this.scene.getEngine().getRenderingCanvas().removeEventListener('pointerup', this.onPointerUp);
            this.scene.getEngine().getRenderingCanvas().removeEventListener('pointermove', this.onPointerMove);
        }
    }

    /**
     * Координатор обработчика событый: Любая кнопка мыши нажата
     * @param event
     */
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

    /**
     * Координатор обработчика событый: Любая кнопка мыши отжата
     * @param event
     */
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

    /**
     * Обработчик событый: Курсор мыши двигается
     * @param event
     */
    onPointerMove(event) {
        let scene = this.scene;
        let camera = this.playerCamera;

        //Если выбрана фигура управления
        if (this.currentControlMesh && this.currentElement) {

            switch (this.currentControlMesh.name) {
                case 'editX':
                {
                    let currentPointOnSupportPlane = this.getPointOnSupportPlane();
                    if (currentPointOnSupportPlane) {
                        let diff = currentPointOnSupportPlane.subtract(this.supportPlane.zeroPoint);
                        this.currentControlMesh.position.x += diff.x;
                        this.currentElement.mesh.setAbsolutePosition(this.currentControlMesh.position);
                        this.supportPlane.zeroPoint = currentPointOnSupportPlane;
                    }

                    break;
                }
                case 'editY':
                {
                    let currentPointOnSupportPlane = this.getPointOnSupportPlane();
                    if (currentPointOnSupportPlane) {
                        let diff = currentPointOnSupportPlane.subtract(this.supportPlane.zeroPoint);
                        this.currentControlMesh.position.y += diff.y;
                        this.currentElement.mesh.setAbsolutePosition(this.currentControlMesh.position);
                        this.supportPlane.zeroPoint = currentPointOnSupportPlane;
                    }

                    break;
                }
                case 'editZ':
                {
                    let currentPointOnSupportPlane = this.getPointOnSupportPlane();
                    if (currentPointOnSupportPlane) {
                        let diff = currentPointOnSupportPlane.subtract(this.supportPlane.zeroPoint);
                        this.currentControlMesh.position.z += diff.z;
                        this.currentElement.mesh.setAbsolutePosition(this.currentControlMesh.position);
                        this.supportPlane.zeroPoint = currentPointOnSupportPlane;
                    }

                    break;
                }
                case 'arcXY':
                {
                    if (this.supportPlane.startPoint) {
                        let currentPointOnSupportPlane = this.getPointOnSupportPlane();

                        if (currentPointOnSupportPlane) {
                            let initAxis = {x: 'x', y: 'y'};
                            let rotationRadian = calc.getRadian(currentPointOnSupportPlane, this.supportPlane.zeroPoint, this.currentControlMesh.radius, initAxis);
                            let startRadian = calc.getRadian(this.supportPlane.startPoint, this.supportPlane.zeroPoint, this.currentControlMesh.radius, initAxis);

                            this.currentElement.mesh.rotation.z = this.currentElement.mesh.rotation.z + (rotationRadian - startRadian);
                            this.supportPlane.startPoint = currentPointOnSupportPlane;
                        }
                    }
                    break;
                }
                case 'arcXZ':
                {
                    if (this.supportPlane.startPoint) {
                        let currentPointOnSupportPlane = this.getPointOnSupportPlane();

                        if (currentPointOnSupportPlane) {
                            let initAxis = {x: 'z', y: 'x'};
                            let rotationRadian = calc.getRadian(currentPointOnSupportPlane, this.supportPlane.zeroPoint, this.currentControlMesh.radius, initAxis);
                            let startRadian = calc.getRadian(this.supportPlane.startPoint, this.supportPlane.zeroPoint, this.currentControlMesh.radius, initAxis);

                            this.currentElement.mesh.rotation.y = this.currentElement.mesh.rotation.y + (rotationRadian - startRadian);
                            this.supportPlane.startPoint = currentPointOnSupportPlane;
                        }
                    }
                    break;
                }
                case 'arcZY':
                {
                    if (this.supportPlane.startPoint) {
                        let currentPointOnSupportPlane = this.getPointOnSupportPlane();

                        if (currentPointOnSupportPlane) {
                            let initAxis = {x: 'y', y: 'z'};
                            let rotationRadian = calc.getRadian(currentPointOnSupportPlane, this.supportPlane.zeroPoint, this.currentControlMesh.radius, initAxis);
                            let startRadian = calc.getRadian(this.supportPlane.startPoint, this.supportPlane.zeroPoint, this.currentControlMesh.radius, initAxis);

                            this.currentElement.mesh.rotation.x = this.currentElement.mesh.rotation.x + (rotationRadian - startRadian);
                            this.supportPlane.startPoint = currentPointOnSupportPlane;
                        }
                    }

                    break;
                }
                case 'dragCursor':
                {
                    let pickInfo = scene.pick(scene.pointerX, scene.pointerY, (mesh)=> {
                        //Исключаем положение самой перетаскиваемой
                        if (_.eq(mesh, this.currentElement.mesh)) {
                            return false;
                        }

                        //Не берем дочерные элементы
                        if (mesh.element) {
                            if (mesh.element.isChildOf(this.currentElement)) {
                                return false;
                            }
                        }

                        //Только элементы которые не скрыты
                        if (_.get(mesh, 'element.visibility') !== VISIBILITY.NORMAL){
                            return false;
                        }

                        //Только элементы на которые можно монтировать
                        return this.currentElement.canBeMountedOn(mesh.element);
                    }, false, camera);

                    if (pickInfo.hit) {

                        //Проверяем объект по правилам монтирования зависящие от положения точки монтирования
                        if (! this.currentElement.canBeMountedOn(pickInfo.pickedMesh.element, pickInfo.pickedPoint)){
                            return false;
                        }

                        //Назначем родителем элемента - элемент под ним
                        this.currentElement.setParent(pickInfo.pickedMesh.element);

                        //Меняем положение фигуры и контрольного элемента
                        this.currentElement.mesh.setAbsolutePosition(pickInfo.pickedPoint);
                        this.currentControlMesh.position = pickInfo.pickedPoint;

                        //Меняем вращение фигуры в зависимости от нормали фигуры на которую навели
                        let axis1 = pickInfo.getNormal();
                        let axis2 = BABYLON.Vector3.Up();
                        let axis3 = BABYLON.Vector3.Up();
                        let start = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, 0);

                        BABYLON.Vector3.CrossToRef(start, axis1, axis2);
                        BABYLON.Vector3.CrossToRef(axis2, axis1, axis3);
                        this.currentElement.mesh.rotation = BABYLON.Vector3.RotationFromAxis(axis3.negate(), axis1, axis2);
                    }
                    break;
                }
                case 'linePoint':
                {
                    let pickInfo = scene.pick(scene.pointerX, scene.pointerY, (mesh)=> {

                        //Только элементы которые не скрыты
                        if (_.get(mesh, 'element.visibility') !== VISIBILITY.NORMAL){
                            return false;
                        }

                        //Только элементы на которые можно монтировать
                        return this.currentElement.canBeMountedOn(mesh.element);
                    }, false, camera);

                    if (pickInfo.hit) {
                        //Точка крепления должна находится на небольшом растоянии от поверхности
                        let pickedPoint = pickInfo.pickedPoint.add(pickInfo.getNormal().multiply(new BABYLON.Vector3(0.05,0.05,0.05)));

                        //Проверяем объект по правилам монтирования зависящие от положения точки монтирования
                        if (! this.currentElement.canBeMountedOn(pickInfo.pickedMesh.element, pickInfo.pickedPoint)){
                            return false;
                        }

                        //Привязываем опорную точку к элементу на который перемещаем
                        this.currentElement.setPointMeshParentElement(this.currentControlMesh, pickInfo.pickedMesh.element);

                        //Меняем положение опорной точки
                        this.currentControlMesh.setAbsolutePosition(pickedPoint);
                    }
                    break;
                }
            }
        }

        if (this.mode === CONTROL_MODES.APPEND) {

            if (this.currentElement) {

                switch (this.currentElement.getTypeKind()) {
                    case 'line':
                    {
                        //ничего не делаем
                        break;
                    }

                    case 'figure':
                    {
                        /**
                         * Перемещаем фигуру за курсором
                         */
                        let pickInfo = scene.pick(scene.pointerX, scene.pointerY, (mesh, foo)=> {
                            //Исключаем положение самой перетаскиваемой
                            if (_.eq(mesh, this.currentElement.mesh)) {
                                return false;
                            }

                            //Только элементы которые не скрыты
                            if (_.get(mesh, 'element.visibility') !== VISIBILITY.NORMAL){
                                return false;
                            }

                            //Только элементы на которых можно монтировать
                            return this.currentElement.canBeMountedOn(mesh.element);
                        }, false, camera);

                        if (pickInfo.hit) {

                            //Проверяем объект по правилам монтирования зависящие от положения точки монтирования
                            if (! this.currentElement.canBeMountedOn(pickInfo.pickedMesh.element, pickInfo.pickedPoint)){
                                return false;
                            }

                            //Назначем родителем элемента - элемент под ним
                            this.currentElement.setParent(pickInfo.pickedMesh.element);

                            //Меняем положение фигуры и контрольного элемента
                            this.currentElement.mesh.setAbsolutePosition(pickInfo.pickedPoint);

                            //Меняем вращение фигуры в зависимости от нормали фигуры на которую навели
                            let axis1 = pickInfo.getNormal();
                            let axis2 = BABYLON.Vector3.Up();
                            let axis3 = BABYLON.Vector3.Up();
                            let start = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, 0);

                            BABYLON.Vector3.CrossToRef(start, axis1, axis2);
                            BABYLON.Vector3.CrossToRef(axis2, axis1, axis3);
                            this.currentElement.mesh.rotation = BABYLON.Vector3.RotationFromAxis(axis3.negate(), axis1, axis2);
                        }
                        break;
                    }
                }
            }
        }
    }

    /**
     * Обработчик событый: Левая кнопка мыши нажата
     * @param event
     */
    onLeftPointerDown(event) {
        let scene = this.scene;
        let pickInfo;

        this.startingMousePoint = {x: event.clientX, y: event.clientY};

        if (this.currentElement) {
            switch (this.currentElement.getTypeKind()) {
                case 'line':
                {
                    //Проверяем если попали в опорную точку линии
                    pickInfo = scene.pick(scene.pointerX, scene.pointerY, (mesh)=> {
                        return _.includes(this.currentElement.pointMeshes, mesh);
                    }, false, this.playerCamera);

                    if (pickInfo.hit) {
                        //Назначаем опорную точку фигурой управления
                        this.setCurrentControlMesh(pickInfo.pickedMesh);
                    }

                    break;
                }
                case 'figure':
                {
                    //Проверяем если попали в фигуру управления
                    pickInfo = scene.pick(scene.pointerX, scene.pointerY, (mesh)=> {
                        return _.includes(this.controlMeshes, mesh);
                    }, false, this.playerCamera);

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
                    break;
                }
            }
        }

        if (this.currentElement) {
            //Сохраняем состояние элемента до действия
            //this.undoItemId = this.scene.undoStack.initUndoItem(this.currentElement);
        }
    }

    /**
     * Обработчик событый: Левая кнопка мыши отжата
     * @param event
     */
    onLeftPointerUp(event) {
        let scene = this.scene;
        let pickInfo;

        this.endingMousePoint = {x: event.clientX, y: event.clientY};

        //Если находимся в режиме APPEND
        if (this.mode === CONTROL_MODES.APPEND) {
            //И выбрана фигура для дополнения
            if (this.currentElement) {
                //Если точка отжима такаяже как и клика - выбираем элемент под курсором
                if (_.isEqual(this.startingMousePoint, this.endingMousePoint)) {

                    switch (this.currentElement.getTypeKind()) {
                        case 'line':
                        {
                            /**
                             * Если попали в опорную точку - завершаем построение линии
                             */

                            pickInfo = scene.pick(scene.pointerX, scene.pointerY, (mesh)=> {
                                return _.includes(this.currentElement.pointMeshes, mesh);
                            }, false, this.playerCamera);

                            if (pickInfo.hit) {

                                //Добавляем элемент в общую базу элементов
                                this.scene.elements.push(this.currentElement);

                                this.unsetCurrentElement();

                                //Выходим из режима редактирования
                                this.setMode(CONTROL_MODES.DRAG);

                                //Выходим из обработчика
                                return;
                            }

                            /**
                             * Добавляем точку нажатия в качестве опорной точки линии
                             */

                            pickInfo = scene.pick(scene.pointerX, scene.pointerY, (mesh)=> {
                                //Только элементы на которые можно монтировать
                                return this.currentElement.canBeMountedOn(mesh.element);
                            }, false, this.playerCamera);

                            if (pickInfo.hit) {
                                //Точка крепления должна находится на небольшом растоянии от поверхности
                                let pickedPoint = pickInfo.pickedPoint.add(pickInfo.getNormal().multiply(new BABYLON.Vector3(0.05,0.05,0.05)));

                                //Проверяем объект по правилам монтирования зависящие от положения точки монтирования
                                if (! this.currentElement.canBeMountedOn(pickInfo.pickedMesh.element, pickInfo.pickedPoint)){
                                    return false;
                                }

                                //Добавляем точку в линию
                                this.currentElement.addPoint(pickedPoint, pickInfo.pickedMesh.element, true);
                            }

                            break;
                        }
                        case 'figure':
                        {
                            this.unsetCurrentControlMesh();
                            this.unsetCurrentElement();

                            //Выходим из режима редактирования
                            this.setMode(CONTROL_MODES.DRAG);

                            //Выходим из обработчика
                            break;
                        }
                    }
                }
            }
            return;
        }

        if (!this.currentControlMesh) {
            //Если точка отжима такаяже как и клика - выбираем элемент под курсором
            if (_.isEqual(this.startingMousePoint, this.endingMousePoint)) {
                pickInfo = scene.pick(scene.pointerX, scene.pointerY, (mesh)=> {

                    //Только элементы которые не скрыты
                    if (_.get(mesh, 'element.visibility') !== VISIBILITY.NORMAL){
                        return false;
                    }

                    //Проверяем что фигура под курсором принадлежит элементу
                    return mesh.element;

                }, false, this.playerCamera);

                if (pickInfo.hit) {
                    //Назначаем выбранный элемент активным
                    this.setCurrentElement(pickInfo.pickedMesh.element)
                }
            }
        }

        //Убираем вспомогательную плоскость
        this.destroySupportPlane();

        //Убираем текущие фигуры управления
        this.unsetCurrentControlMesh();

        //Сохраняем состояние элемента после действия
        if (this.currentElement) {
            //Сохраняем состояние элемента после действия
            //if (this.undoItemId !== null) {
            //    this.undoItemId = this.scene.undoStack.fillUndoItem(this.undoItemId, 'edit');
            //    this.undoItemId = null;
            //}
        }
    }

    /**
     * Обработчик событый: Средняя кнопка мыши нажата
     * @param event
     */
    onMiddlePointerDown(event) {
        //
    }

    /**
     * Обработчик событый: Средняя кнопка мыши отжата
     * @param event
     */
    onMiddlePointerUp(event) {
        //Восстанавливаем состояние
        //this.scene.undoStack.undo();
    }

    /**
     * Обработчик событый: Правая кнопка мыши нажата
     * @param event
     */
    onRightPointerDown(event) {
        //
    }

    /**
     * Обработчик событый: Правая кнопка отжата
     * @param event
     */
    onRightPointerUp(event) {
        //this.scene.undoStack.redo();
    }

    /**
     * Создать вспомогательную плоскость
     * @param parentMesh
     * @param rotation
     */
    createSupportPlane(parentMesh, rotation) {
        //Если уже назначена вспомогательная плоскость - убираем её
        if (this.supportPlane) {
            this.destroySupportPlane();
        }

        this.supportPlane = BABYLON.Mesh.CreatePlane('supportPlane', 100.0, this.scene, false, BABYLON.Mesh.FRONTSIDE);

        //Настройка материала плоскости (используется для дебага)
        this.supportPlane.material = new BABYLON.StandardMaterial('mat', this.scene);
        this.supportPlane.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
        this.supportPlane.material.alpha = 0.3;
        this.supportPlane.material.backFaceCulling = false;

        //Плоскость не видна пользователю
        this.supportPlane.isVisible = false;

        //Привязываем позицию плоскости к позиции фигуры управления
        this.supportPlane.position = parentMesh.absolutePosition;

        //Если было указано вращение плоскости
        if (rotation) {
            this.supportPlane.rotation = rotation;
        }

        //Сохраняем 'нулевую' точку на вспомогательной плоскости
        this.supportPlane.zeroPoint = parentMesh.getAbsolutePosition().clone();

        /**
         * Сохраняем координату указателя на плоскости (до и после вращения - это важно!)
         */

        //Сейчас
        this.supportPlane.startPoint = this.getPointOnSupportPlane();

        //И после того как матрица вспомогательной плоскости обновится после вращения
        this.supportPlane.registerAfterWorldMatrixUpdate(() => {
            this.supportPlane.startPoint = this.getPointOnSupportPlane();
        });
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
        let scene = this.scene;
        let camera = this.playerCamera;

        let pickinfo = scene.pick(scene.pointerX, scene.pointerY, (mesh) => {
            return _.eq(mesh, this.supportPlane);
        }, false, camera);
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }

    /**
     * Назначить текущий редактируемый элемент
     * @param element
     */
    setCurrentElement(element) {

        //Убираем все элементы управления
        this.hideControl();

        //Отключаем подсветку для всех элементов
        _.each(this.scene.elements, (element) => {
            element.disableHighlight();
        });

        //Если выбран тот же элемент - выходим
        if (_.eq(this.currentElement, element)) {
            this.unsetCurrentElement();
            return;
        }

        //Убираем старый выбранный элемент
        this.unsetCurrentElement();

        //Специальный элемент не может быть выбран
        if (element.isSpecial()) {
            return;
        }

        this.currentElement = element;

        //Подсвечиваем активный элемент
        this.currentElement.enableHighlight(true);

        //Показывем элементы выбранного управления элемента
        this.showControl();

        //Подсвечиваем элементы на которых можно смотнировать выбранный элемент
        this.colorMountCompatibleElements();
    }

    /**
     * Снять назначение с текущего изменяемого элемента
     */
    unsetCurrentElement() {
        if (this.currentElement) {
            this.currentElement.disableHighlight(true);

            this.currentElement = null;
        }

        this.unColorMountCompatibleElements();
    }

    /**
     * Подсветить элементы на которые можно смонтировать
     */
    colorMountCompatibleElements() {
        _.each(this.scene.elements, (element) => {
            if (this.currentElement.canBeMountedOn(element)) {
                element.colorMountCompatible();
            } else {
                element.colorMountIncompatible();
            }
        })
    }

    /**
     * Снять подсветку возможности монтировать
     */
    unColorMountCompatibleElements() {
        _.each(this.scene.elements, (element) => {
            element.unColor();
        })
    }

    /**
     * Назначить активную фигуру управления
     * @param mesh
     */
    setCurrentControlMesh(mesh) {
        //При назначеной фигуре отключаем управление камерой
        this.scene.disableControl();

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
        this.scene.enableControl();

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
            switch (this.currentElement.getTypeKind()) {
                case 'line':
                {
                    //Ничего не делаем
                    break;
                }
                case 'figure':
                {
                    //Вешаем на элемент инструменты редактирования в зависимости от выбранного режима редактирования
                    switch (this.mode) {
                        case CONTROL_MODES.MOVE:
                            this.showMoveAxis();
                            break;
                        case CONTROL_MODES.ROTATE:
                            this.showRotateAxis();
                            break;
                        case CONTROL_MODES.DRAG:
                            this.showDragCursor();
                            break;
                    }
                    break;
                }
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
        let scene = this.scene;
        let mesh = this.currentElement.mesh;

        //Создаем ось X
        let axisX = BABYLON.Mesh.CreateLines('axisX', [
            new BABYLON.Vector3.Zero(),
            new BABYLON.Vector3(size, 0, 0)
        ], scene);
        axisX.position = mesh.absolutePosition;
        axisX.color = new BABYLON.Color3(1, 0, 0);

        //Создаем ось Y
        let axisY = BABYLON.Mesh.CreateLines('axisY', [
            new BABYLON.Vector3.Zero(),
            new BABYLON.Vector3(0, size, 0)
        ], scene);
        axisY.position = mesh.absolutePosition;
        axisY.color = new BABYLON.Color3(0, 1, 0);

        //Создаем ось Z
        let axisZ = BABYLON.Mesh.CreateLines('axisZ', [
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
        let scene = this.scene;

        let size = 2;

        //Показать контрольные оси
        this.showControlAxises(size);

        //Создаем фигуру editX
        let xBox = BABYLON.Mesh.CreateBox('editX', size / 10, scene);
        xBox.setPivotMatrix(BABYLON.Matrix.Translation(size, 0, 0));
        xBox.position = mesh.absolutePosition;
        let xBoxMaterial = new BABYLON.StandardMaterial('boxMaterial', scene);
        xBoxMaterial.diffuseColor = BABYLON.Color3.Red();
        xBox.material = xBoxMaterial;

        //Создаем фигуру editY
        let yBox = BABYLON.Mesh.CreateBox('editY', size / 10, scene);
        yBox.setPivotMatrix(BABYLON.Matrix.Translation(0, size, 0));
        yBox.position = mesh.absolutePosition;
        let yBoxMaterial = new BABYLON.StandardMaterial('boxMaterial', scene);
        yBoxMaterial.diffuseColor = BABYLON.Color3.Green();
        yBox.material = yBoxMaterial;

        //Создаем фигуру editZ
        let zBox = BABYLON.Mesh.CreateBox('editZ', size / 10, scene);
        zBox.setPivotMatrix(BABYLON.Matrix.Translation(0, 0, size));
        zBox.position = mesh.absolutePosition;
        let zBoxMaterial = new BABYLON.StandardMaterial('boxMaterial', scene);
        zBoxMaterial.diffuseColor = BABYLON.Color3.Blue();
        zBox.material = zBoxMaterial;

        //Добавляем фигуры редактирования в массив объекта для последующей манипуляции с ними
        this.controlMeshes.push(xBox, yBox, zBox);

        //Элементы управления не видны на миникарте
        _.each(this.controlMeshes, (mesh) => {
            mesh.renderingGroupId = 1;
        })
    };

    /**
     * Отобразить оси вращения
     */
    showRotateAxis() {

        let mesh = this.currentElement.mesh;
        let scene = this.scene;

        let size = 2;

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
            return size / 15;
        };

        var arcXY = BABYLON.Mesh.CreateTube('arcXY', curveXY, 2, 60, radiusFunction, 2, scene, false, BABYLON.Mesh.FRONTSIDE);
        arcXY.position = mesh.absolutePosition;
        arcXY.material = new BABYLON.StandardMaterial('boxMaterial', scene);
        arcXY.material.diffuseColor = new BABYLON.Color3(1, 1, 0);
        arcXY.radius = radiusFunction();

        var arcXZ = BABYLON.Mesh.CreateTube('arcXZ', curveXZ, 2, 60, radiusFunction, 2, scene, false, BABYLON.Mesh.FRONTSIDE);
        arcXZ.position = mesh.absolutePosition;
        arcXZ.material = new BABYLON.StandardMaterial('boxMaterial', scene);
        arcXZ.material.diffuseColor = new BABYLON.Color3(1, 0, 1);
        arcXZ.radius = radiusFunction();

        var arcZY = BABYLON.Mesh.CreateTube('arcZY', curveZY, 2, 60, radiusFunction, 2, scene, false, BABYLON.Mesh.FRONTSIDE);
        arcZY.position = mesh.absolutePosition;
        arcZY.material = new BABYLON.StandardMaterial('boxMaterial', scene);
        arcZY.material.diffuseColor = new BABYLON.Color3(0, 1, 1);
        arcZY.radius = radiusFunction();

        //Добавляем фигуры редактирования в массив объекта для последующей манипуляции с ними
        this.controlMeshes.push(arcXY, arcXZ, arcZY);

        //Элементы управления не видны на миникарте
        _.each(this.controlMeshes, (mesh) => {
            mesh.renderingGroupId = 1;
        })
    }

    /**
     * Отобразить точку для drag'n'drop элемента
     */
    showDragCursor() {
        let mesh = this.currentElement.mesh;
        let scene = this.scene;

        let size = 2;

        //Создаем фигуру
        let dragCursor = BABYLON.Mesh.CreateSphere('dragCursor', 5, size / 5, scene, false, BABYLON.Mesh.FRONTSIDE);
        dragCursor.position = mesh.absolutePosition;
        let dragCursorMaterial = new BABYLON.StandardMaterial('dragCursorMaterial', scene);
        dragCursorMaterial.diffuseColor = BABYLON.Color3.Red();

        //Материал не реагирует на свет
        dragCursorMaterial.emissiveColor = BABYLON.Color3.White();
        dragCursorMaterial.linkEmissiveWithDiffuse = true;

        dragCursorMaterial.alpha = 0.6;
        dragCursor.material = dragCursorMaterial;

        //Добавляем фигуры редактирования в массив объекта для последующей манипуляции с ними
        this.controlMeshes.push(dragCursor);

        //Элементы управления не видны на миникарте
        _.each(this.controlMeshes, (mesh) => {
            mesh.renderingGroupId = 1;
        })
    }

    showLinePoints() {
        let mesh = this.currentElement.mesh;
        let scene = this.scene;
    }

    /**
     * Выставить режим редактирования
     * @param mode
     */
    setMode(mode) {
        this.mode = mode;

        //Переделываем элементы управления
        this.hideControl();
        this.showControl();

        //Меняем состояние кнопки интерфейса
        modeButtonsActions.setControlMode(mode, false);
    }

    /**
     * Удалить выделенный элемент
     */
    deleteElement() {
        //Прячем элементы управления элементов
        this.hideControl();

        //Только если выбран элемент для редактирования
        if (this.currentElement) {
            //Удаляем элемент
            this.currentElement.remove();
        }
    }

    /**
     * Функция отвечающая за инициализацию покадровых действий
     */
    update() {
        //Меняем размер фигур управления в зависимости от удаленности камеры
        _.each(this.controlMeshes, (mesh) => {
            let scale = BABYLON.Vector3.Distance(this.playerCamera.position, this.currentElement.mesh.position) / 15;
            mesh.scaling = new BABYLON.Vector3(scale, scale, scale);
        })
    }

}
