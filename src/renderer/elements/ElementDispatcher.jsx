import Sky from './special/Sky'
import Ground from './special/Ground'
import Line from './line/Line'
import Figure from './figure/Figure'
import Building from './figure/Building'

export default class {

    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Создать элемент
     * @param elementData
     */
    createElement(elementData) {

        let element;

        let type = this.getTypeById(elementData.type_id);

        if (!type) {
            console.warn('Element has no type');
            return false;
        }

        switch (type.kind) {
            case 'special':
                switch (type.code_class) {
                    case 'sky':
                        element = new Sky(this.scene, elementData);
                        break;

                    case 'ground':
                        element = new Ground(this.scene, elementData);
                        break;
                }
                break;

            case 'figure':
                element = new Figure(this.scene, elementData);
                break;

            case 'line':
                element = new Line(this.scene, elementData);
                break;
        }

        //Добавляем элемент в общую базу элементов
        if (element) {
            this.scene.elements.push(element);
        }

        //Выставляем отображение элемента в зависимости от натсроек сцены
        element.setViewMode(this.scene.viewMode);

        return element;
    }

    /**
     * Получить объект типа элемента по его ID
     * @param typeId
     */
    getTypeById(typeId) {
        return this.scene.typeCatalog[typeId];
    }

}