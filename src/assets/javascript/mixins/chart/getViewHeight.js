export default function(vm, containerWidth) {
    return containerWidth / (vm.dimensions.aspectW/vm.dimensions.aspectH);
}