import { shallowRef, type ShallowRef } from 'vue';
import { ImageBuffer } from './ImageBuffer';

// Shared singleton reference across the entire app
const imageBufferInstance: ShallowRef<ImageBuffer | null> = shallowRef(null);

export function useImageBufferState() {
  const setImageBuffer = (instance: ImageBuffer) => {
    imageBufferInstance.value = instance;
  };

  const destroyImageBuffer = () => {
    if (imageBufferInstance.value?.canvas) {
      imageBufferInstance.value.canvas.dispose();
    }
    imageBufferInstance.value = null;
  };

  return {
    // Shared reactive reference
    imageBuffer: imageBufferInstance,
    setImageBuffer,
    destroyImageBuffer,
  };
}