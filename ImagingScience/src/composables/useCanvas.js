import { shallowRef } from 'vue';

const canvasInstance = shallowRef(null);

export function useCanvasState() {
  const setCanvas = (instance) => {
    canvasInstance.value = instance;
  };

  return {
    canvasInstance,
    setCanvas,
  };
}