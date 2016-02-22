export default class {

    constructor(Map) {
        this.Map = Map;
        this.stack = [];
        this.current = null;
    }

    /**
     * Отменить последнее действие
     */
    undo() {
        //Если курсор не указывает на определнный undo в стеке - берем последний
        if (this.current === null){
            this.current = this.stack.length - 1;
        }

        let undo = this.stack[this.current];

        if (undo){
            this._doUndo(undo);
        }

        if (this.stack[this.current - 1]){
            this.current--;
        }
    }

    /**
     * Произвести действие по отмене
     * @param undo
     * @private
     */
    _doUndo(undo){
        switch(undo.actionType){
            case 'edit':{
                undo.element.parent = undo.before.parent;
                if (undo.element.parent){
                    undo.element.mesh.parent = undo.element.parent.mesh;
                } else {
                    undo.element.mesh.parent = null;
                }

                undo.element.mesh.position = undo.before.position.clone();
                undo.element.mesh.rotation = undo.before.rotation.clone();
                undo.element.mesh.scaling = undo.before.scaling.clone();
                break;
            }
            case 'remove': {
                //TODO
                break;
            }
            case 'add': {
                //TODO
                break;
            }
        }
    }


    /**
     * Отменить отмену последнего действия
     * @returns {boolean}
     */
    redo(){
        //Если курсор не указывает - значит redo невозможен
        if (this.current === null){
            return false;
        }

        let redo = this.stack[this.current];
        if (redo){
            this._doRedo(redo);
        }

        if (this.stack[this.current + 1]){
            this.current++;
        }
    }

    /**
     * Произвести действие по отмене отмены
     * @param redo
     * @private
     */
    _doRedo(redo){
        switch(redo.actionType){
            case 'edit':{
                redo.element.parent = redo.after.parent;
                if (redo.element.parent){
                    redo.element.mesh.parent = redo.element.parent.mesh;
                } else {
                    redo.element.mesh.parent = null;
                }


                redo.element.mesh.position = redo.after.position.clone();
                redo.element.mesh.rotation = redo.after.rotation.clone();
                redo.element.mesh.scaling = redo.after.scaling.clone();
                break;
            }
            case 'remove': {
                //TODO
                break;
            }
            case 'add': {
                //TODO
                break;
            }
        }
    }

    /**
     * Инициализироать действие отмены. Сохранить текущее положение элемента
     * @returns {*} Возмращает ID инициализированного действия отмены
     */
    initUndoItem(element){

        if (this.current !== null) {
            this.removeItemsAfter(this.current);
            this.current = null;
        }
        return this.stack.push({
                element: element,
                before:{
                    position: element.mesh.position.clone(),
                    rotation: element.mesh.rotation.clone(),
                    scaling: element.mesh.scaling.clone(),
                    parent: element.parent
                }
            }) - 1;
    }

    /**
     * Внести измененное состояние элемента
     * @param undoItemId ID действия в стеке
     * @param actionType Тип действия над элементов
     * @param after Состояние после правки
     */
    fillUndoItem(undoItemId, actionType){
        let undoStackItem = this.stack[undoItemId];
        undoStackItem.actionType = actionType;
        undoStackItem.after = {
            position: undoStackItem.element.mesh.position.clone(),
            rotation: undoStackItem.element.mesh.rotation.clone(),
            scaling: undoStackItem.element.mesh.scaling.clone(),
            parent: undoStackItem.element.parent
        };

        //Если действие правки
        if (actionType === 'edit'){
            //И исходное состояние равно измененному
            if(_.isEqual(undoStackItem.after, undoStackItem.before)){
                //Удаляем это действие из истории
                _.pullAt(this.stack, undoItemId);
                return false;
            }
        }
    }

    /**
     * Ибрать из истории все записи после указанного ID
     * @param undoItemId
     */
    removeItemsAfter(undoItemId){
        _.pullAt(this.stack, _.range(undoItemId, this.stack.length - 1));
    }

}