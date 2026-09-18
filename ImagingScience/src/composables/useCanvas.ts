import { shallowRef, type ShallowRef } from 'vue';
import { Canvas } from 'fabric'; 

const canvasInstance : ShallowRef<Canvas | null> = shallowRef(null);

export function useCanvasState() {
  const setCanvas = (instance : Canvas) => {
    canvasInstance.value = instance;
  };

  return {
    canvasInstance,
    setCanvas,
  };
}