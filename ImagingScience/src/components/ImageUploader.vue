<template>
    Upload your Image here
    <input type="file"  ref="imageInput" @change="handleImageUpload">
</template> 

<script setup>
    import { FabricImage } from 'fabric';
    import { useCanvasState } from '../composables/useCanvas.js'
    const { canvasInstance } = useCanvasState();


    const  handleImageUpload = async (e) => {
        const image = e.target.files[0];
        const reader = new FileReader();
        const canvas = canvasInstance.value;
        if (!canvas) {
            console.warn('Canvas instance is not ready yet');
            return;
        }
        const imageUrl = URL.createObjectURL(image);
        const img = await FabricImage.fromURL(imageUrl);
        
        
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
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
    }


    function uploadImageToCanvas(img) {
        const c = document.getElementById("imageCanvas");
        var ctx = c.getContext("2d");

        var targetImageHeight = null;
        var targetImageWidth = null;

        var targetImageX = 0;
        var targetImageY = 0;
        if (img.width - c.width > img.width - c.height) {
            targetImageWidth = c.width;
            targetImageHeight = img.height * (c.width / img.width)
            targetImageY = (c.height - targetImageHeight) / 2
        }
        else {
            targetImageHeight = c.height;
            targetImageWidth = img.width * (c.height / img.height)
            targetImageX = (c.width - targetImageWidth) / 2
        }
        
        ctx.drawImage(img, 0, 0, img.width, img.height, targetImageX, targetImageY, targetImageWidth, targetImageHeight );
    }
</script>