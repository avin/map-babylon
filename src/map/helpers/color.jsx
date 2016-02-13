export default {

    /**
     * Конвертация hex-строки цвета в формат Бабилона
     * @param hex
     * @returns {BABYLON.Color3.FromInts}
     */
    hexColorToBabylonColor3(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        let color = result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;

        if (color) {
            return new BABYLON.Color3.FromInts(color.r, color.g, color.b)
        } else {
            return new BABYLON.Color3(0.1, 0.1, 0.1)
        }
    },


}