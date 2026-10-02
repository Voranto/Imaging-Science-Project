import { ref } from "vue";

export const backgroundColorSelector = ref(255);

export const getBackgroundColor = () => {
    return backgroundColorSelector.value;
}
export const setBackgroundColor = (val : number) => {
    backgroundColorSelector.value = val;
}