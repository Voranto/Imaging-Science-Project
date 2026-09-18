import { ref, type Ref } from 'vue';
import axios from 'axios';
import { useCanvasState } from './useCanvas.js'

const { canvasInstance } = useCanvasState();

export const transformRequested : Ref<boolean> = ref(false);
export const transformImageSrc = ref('');


const FFT_COMPUTE_URL = "http://localhost:8000/api/fft/compute_color";
export async function getFFT() {
    
    const canvas = canvasInstance.value;
    if (!canvas) return;
    const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1.0,
        multiplier: 1
    });
    
    const blob = await fetch(dataURL).then(res => res.blob());
    const formData = new FormData();
    formData.append('image', blob, 'canvas-export.png'); 
    console.log(blob);
    try {
        const response = await axios.post(FFT_COMPUTE_URL,formData, {
            responseType: 'blob',
        });
        

        const result = response.data;
        console.log('Upload success:', result);
        const imageUrl = URL.createObjectURL(response.data);
        transformImageSrc.value = imageUrl;
    } catch (error) {
        console.error('Upload failed:', error);
    }



    transformRequested.value = true;
}