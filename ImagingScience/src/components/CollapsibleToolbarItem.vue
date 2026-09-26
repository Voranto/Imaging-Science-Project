<script setup>
defineProps({
  title: String,
  isOpen: {
    type: Boolean,
    default: false
  }
});

defineEmits(['toggle']);
</script>

<template>
  <div class="collapsible">
    <button type="button" class="header-btn" @click="$emit('toggle')">
      <span class="title">{{ title }}</span>
      <span class="arrow" :class="{ open: isOpen }">▾</span>
    </button>

    <Transition name="collapse">
      <div v-show="isOpen" class="content-wrapper">
        <div class="content-inner">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>
<style scoped>
/* Header styling */
.header-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

/* Hover state: elevation & highlight */
.header-btn:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

/* Active click effect */
.header-btn:active {
  background-color: #f1f5f9;
  transform: translateY(1px);
}

.arrow {
  font-size: 0.8rem;
  color: #64748b;
  transition: transform 0.25s ease;
}

.arrow.open {
  transform: rotate(180deg);
}

/* Grid & Slotted Content Styles */
:deep(.button-grid) {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 0 4px 0;
  width: 100%;
}

:deep(.btn-item) {
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  font-size: 0.85rem;
  background-color: #f8fafc;
  color: #334155;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

:deep(.btn-item:hover) {
  background-color: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

/* Transition styles */
.content-wrapper {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.25s ease, opacity 0.2s ease;
}

.content-inner {
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}
</style>