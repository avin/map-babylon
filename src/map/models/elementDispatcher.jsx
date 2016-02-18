import Sky from './Special/Sky'
import Ground from './Special/Ground'
import Line from './Line/Line'
import Figure from './Figure/Figure'
import Building from './Figure/Building'

export default class {

    constructor(Map) {
        this.Map = Map;
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
                        element = new Sky(this.Map, elementData);
                        break;

                    case 'ground':
                        element = new Ground(this.Map, elementData);
                        break;
                }
                break;

            case 'figure':
                element = new Figure(this.Map, elementData);
                break;

            case 'line':
                element = new Line(this.Map, elementData);
                break;
        }

        //Добавляем элемент в общую базу элементов
        if (element) {
            this.Map.elements.push(element);
        }
        return element;
    }

    /**
     * Получить объект типа элемента по его ID
     * @param typeId
     */
    getTypeById(typeId) {
        return this.Map.typeCatalog[typeId];
    }
}