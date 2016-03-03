export default class extends BABYLON.ConvolutionPostProcess {

    constructor(name, kernel, ratio, camera, samplingMode, engine, reusable) {
        super(name, kernel, ratio, camera, samplingMode, engine, reusable);
        //"Sepia", BABYLON.ConvolutionPostProcess.EmbossKernel, 1.5, camera
    }

}