import { ref } from "vue";

export const colorSelector = ref(0);

export const getColorSelector = () => {
    return colorSelector.value;
}
export const setColorSelector = (val : number) => {
    colorSelector.value = val;
}