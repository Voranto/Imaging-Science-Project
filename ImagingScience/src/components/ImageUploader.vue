<template>
    Upload your Image here
    <hr>
    <input type="file"  ref="imageInput" @change="(event) => handleFileUpload(event)">
</template> 

<script setup lang="ts">
    import { ref } from "vue";

    const form = ref({
    media: {},
    });

    const emit = defineEmits<{
        (e: 'uploaded'): void
    }>();

    const imageSrc = ref<string[]>([]);
    const selectedFiles = ref<File[]>([]);
    const imageInput = ref<HTMLInputElement | null>(null)


    const handleFileUpload = (e : Event) => {
        var files = imageInput.value?.files

        if (files == null || !files.length) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file) continue;
            if (i == 0) form.value.media = file;
            selectedFiles.value.push(file);
            const src = URL.createObjectURL(file);
            imageSrc.value.push(src);
        }
        emit('uploaded');
    }

</script>