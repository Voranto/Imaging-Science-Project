import { ref, type Ref } from 'vue';

export const transformRequested : Ref<boolean> = ref(false);
export function getFFT() {

    console.log("im here")
    transformRequested.value = true;
}