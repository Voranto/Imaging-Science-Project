<template>
  <div class="uploader-container">
    <input type="file" ref="imageInput" @change="handleImageUpload" class="file-input">
    <span>Example Images:</span>
    <div id="carousel-wrapper">
      <button 
        v-for="(src, index) in imageSrc" 
        :key="src"
        class="carousel-item"
        @click="renderImage(src)"
        type="button"
        aria-label="Select thumbnail"
      >
        <img :src="src" alt="Thumbnail" />
        <div class="hover-overlay"></div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
    import { FabricImage, filters } from 'fabric';
    import { useImageBufferState } from '../composables/useImageBufferState.ts';

    const { imageBuffer, setImageBuffer, destroyImageBuffer } = useImageBufferState();
    const emit = defineEmits([
    'closeActiveMenu', 
    ]);
    const imageSrc = [
        new URL('../assets/house.jpg', import.meta.url).href,
        new URL('../assets/beach.jpg', import.meta.url).href,
        new URL('../assets/tiger.jpg', import.meta.url).href,
        new URL('../assets/mario.jpg', import.meta.url).href,
    ];

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
        
        
    }
    const renderImage = async ( imageURL : string) => {
        const canvas = imageBuffer.value?.canvas;
        if (!canvas) {
            console.warn('Canvas instance is not ready yet');
            return;
        }
        // Convert the image to grayscale
        const img = await FabricImage.fromURL(imageURL);
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
        img.set({ left: targetImageX, top: targetImageY});
        img.set("customType", "image");
        img.set("originX", "left");
        img.set("originY", "top");
        img.set({
            lockSkewingX: true,
            lockSkewingY: true,
        })
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        emit("closeActiveMenu");
        imageBuffer.value?.syncFloatBuffer();
    }
</script>
<style scoped>
.uploader-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Made the label span more visible */
.uploader-container > span {
  font-size: 0.9rem;
  color: #1f2937; /* Darker, high-contrast color */
  letter-spacing: 0.01em;
}

/* Polished carousel wrapper */
#carousel-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 4px;
  overflow-x: auto;
  scroll-behavior: smooth;
  /* Thin custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

#carousel-wrapper::-webkit-scrollbar {
  height: 4px;
}

#carousel-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

/* Compact thumbnail button frame */
.carousel-item {
  position: relative;
  display: inline-flex;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 6px;
  background: none;
  cursor: pointer;
  overflow: hidden;
  outline: none;
  flex-shrink: 0;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

/* Capped thumbnail image size */
.carousel-item img {
  display: block;
  height: 80px;
  width: auto;
  object-fit: cover;
  border-radius: 4px;
}

/* Darkening overlay layer */
.hover-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0);
  border-radius: 4px;
  pointer-events: none;
  transition: background-color 0.2s ease;
}

/* Hover state */
.carousel-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.carousel-item:hover .hover-overlay {
  background-color: rgba(0, 0, 0, 0.35);
}

/* Click press feedback */
.carousel-item:active {
  transform: translateY(0) scale(0.95);
}
</style>