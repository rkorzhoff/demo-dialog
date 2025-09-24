<template>
  <!-- App content -->
  <slot />

  <!-- Render all dialogs -->
  <Dialog
    v-for="dialog in store.dialogs"
    :key="dialog.id"
    :dialog="dialog"
    @close="store.hideDialog(dialog.id)"
  />
</template>

<script setup lang="ts">
import { provide } from 'vue'
import Dialog from './Dialog.vue'
import { createDialogStore, DIALOG_PROVIDER_KEY } from '@/composables/useDialog'

// Create the dialog store
const store = createDialogStore()

// Provide the store to child components
provide(DIALOG_PROVIDER_KEY, store)

// Global keyboard event handler
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    // Find the topmost non-persistent dialog and close it
    const visibleDialogs = store.dialogs.filter((d) => d.isVisible)
    const topDialog = visibleDialogs[visibleDialogs.length - 1]

    if (topDialog && !topDialog.options.persistent) {
      store.hideDialog(topDialog.id)
      event.preventDefault()
    }
  }
}

// Add global event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}

// Cleanup on unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
  }
})

// Expose store for debugging (optional)
defineExpose({
  store,
})
</script>

<style scoped>
.dialog-provider {
  /* This component doesn't need specific styles */
  /* It just provides context and renders dialogs */
}
</style>
