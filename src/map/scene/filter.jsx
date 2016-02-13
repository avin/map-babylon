export default {

    setSepiaFilter(camera){
        var postProcess = new BABYLON.ConvolutionPostProcess("Sepia", BABYLON.ConvolutionPostProcess.EmbossKernel, 1.5, camera);
    }
}