<template>
    Upload your Image here
    <input type="file"  ref="imageInput" @change="handleImageUpload">
</template> 

<script setup lang="ts">
    import { FabricImage, filters } from 'fabric';
    import { useImageBufferState } from '../composables/useImageBufferState.ts';

    const { imageBuffer, setImageBuffer, destroyImageBuffer } = useImageBufferState();


    const  handleImageUpload = async (e : Event) => {
        const target = e.target as HTMLInputElement;
        if (!target.files || target.files.length === 0) return;

        const image = target.files[0];
        const reader = new FileReader();
        const canvas = imageBuffer.value?.canvas;
        if (!canvas) {
            console.warn('Canvas instance is not ready yet');
            return;
        }
        if (!image) return;
        const imageUrl = URL.createObjectURL(image);
        
        // Convert the image to grayscale
        const img = await FabricImage.fromURL(imageUrl);
        img.filters.push(new filters.Grayscale());
        img.applyFilters();

        var targetImageHeight = null;
        var targetImageWidth = null;

        var targetImageX = 0;
        var targetImageY = 0;
        if (img.width - canvas.width > img.width - canvas.height) {
            targetImageWidth = canvas.width;
            targetImageHeight = img.height * (canvas.width / img.width)
            targetImageY = (canvas.height - targetImageHeight) / 2
        }
        else {
            targetImageHeight = canvas.height;
            targetImageWidth = img.width * (canvas.height / img.height)
            targetImageX = (canvas.width - targetImageWidth) / 2
        }
        img.scaleToWidth(targetImageWidth);
        img.scaleToHeight(targetImageHeight);
        img.set({ left: targetImageX + targetImageWidth / 2, top: targetImageY + targetImageHeight  /2});
        img.set("customType", "image");
        img.set("originX", "top");
        img.set("originY", "left");
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
    }
</script>