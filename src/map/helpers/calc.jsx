export default {

    getRadian(point, center, radius, initAxis){

        let cX = center[initAxis.x];
        let cY = center[initAxis.y];

        let vX = (point[initAxis.x] - cX);
        let vY = (point[initAxis.y] - cY);
        let magV = Math.sqrt(vX*vX + vY*vY);
        let aX = cX + vX / magV * radius;
        let aY = cY + vY / magV * radius;

        return Math.atan2(aY - cY, aX - cX);

    }
}