<template>
  <Transition name="dialog-content" @enter="onContentEnter" @leave="onContentLeave" appear>
    <dialog
      v-if="dialog.isVisible"
      ref="dialogRef"
      :class="[
        'app-dialog',
        `app-dialog--${dialog.options.type}`,
        {
          'app-dialog--persistent': dialog.options.persistent,
        },
      ]"
      :style="{
        maxWidth: dialog.options.maxWidth || '500px',
      }"
      @click="handleDialogClick"
      @close="handleClose"
    >
      <div class="app-dialog__content" @click.stop>
        <!-- Header -->
        <header
          v-if="dialog.options.title || dialog.options.showCloseButton"
          class="app-dialog__header"
        >
          <h3 v-if="dialog.options.title" class="app-dialog__title">
            <span v-if="dialog.options.type === 'error'" class="app-dialog__icon">❌</span>
            <span v-else-if="dialog.options.type === 'warning'" class="app-dialog__icon">⚠️</span>
            <span v-else-if="dialog.options.type === 'success'" class="app-dialog__icon">✅</span>
            <span v-else-if="dialog.options.type === 'confirm'" class="app-dialog__icon">❓</span>
            <span v-else class="app-dialog__icon">ℹ️</span>
            {{ dialog.options.title }}
          </h3>
          <button
            v-if="dialog.options.showCloseButton && !dialog.options.persistent"
            @click="handleClose"
            class="app-dialog__close"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </header>

        <!-- Body -->
        <main class="app-dialog__body">
          <!-- Custom component -->
          <component
            v-if="dialog.options.component"
            :is="dialog.options.component"
            v-bind="dialog.options.props"
            @close="handleClose"
          />

          <!-- Simple content -->
          <div v-else-if="dialog.options.content" class="app-dialog__text">
            {{ dialog.options.content }}
          </div>

          <!-- Slot content -->
          <slot v-else />
        </main>

        <!-- Actions -->
        <footer v-if="dialog.options.actions?.length" class="app-dialog__actions">
          <button
            v-for="action in dialog.options.actions"
            :key="action.label"
            @click="handleAction(action)"
            :class="['app-dialog__action', `app-dialog__action--${action.variant || 'secondary'}`]"
            :disabled="action.loading"
          >
            <span v-if="action.loading" class="app-dialog__spinner"></span>
            {{ action.label }}
          </button>
        </footer>
      </div>
    </dialog>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { DialogState, DialogAction } from '@/types/dialog'

// Component name for Vue DevTools
defineOptions({
  name: 'AppDialog',
})

interface Props {
  dialog: DialogState
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const dialogRef = ref<HTMLDialogElement>()

// Handle transition callbacks
const onContentEnter = async (el: Element) => {
  await nextTick()
  // Show the native dialog as modal when animation starts
  if (dialogRef.value && !dialogRef.value.open) {
    dialogRef.value.showModal()
  }
}

const onContentLeave = (el: Element) => {
  // Close the native dialog when animation starts
  if (dialogRef.value && dialogRef.value.open) {
    dialogRef.value.close()
  }
}

const handleClose = () => {
  if (!props.dialog.options.persistent) {
    emit('close')
  }
}

const handleDialogClick = (event: MouseEvent) => {
  // Handle clicks on the dialog backdrop (native dialog behavior)
  if (event.target === dialogRef.value && !props.dialog.options.persistent) {
    handleClose()
  }
}

const handleAction = async (action: DialogAction) => {
  try {
    // Set loading state
    action.loading = true

    // Execute action
    await action.action()
  } catch (error) {
    console.error('Dialog action error:', error)
  } finally {
    // Reset loading state
    action.loading = false
  }
}
</script>

<style scoped>
/* Dialog content animations */
.dialog-content-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dialog-content-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.6, 1);
}

.dialog-content-enter-from {
  opacity: 0;
  transform: scale(0.7) translateY(-30px);
}

.dialog-content-enter-to {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.dialog-content-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.dialog-content-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.app-dialog {
  border: none;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);

  background: white;
  color: #2c3e50;
  max-height: calc(100vh - 2rem);
  overflow: hidden;
  margin: auto;
}

/* Style native backdrop */
.app-dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.app-dialog--persistent::backdrop {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(3px);
}

.app-dialog__content {
  display: flex;
  flex-direction: column;
  min-height: 150px;
}

/* Header */
.app-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 1rem;
}

.app-dialog__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.app-dialog__icon {
  font-size: 1.1rem;
}

.app-dialog__close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  color: #6c757d;
  transition: all 0.2s ease;
  line-height: 1;
}

.app-dialog__close:hover {
  background: #f8f9fa;
  color: #495057;
}

/* Body */
.app-dialog__body {
  flex: 1;
  padding: 0 1.5rem;
  min-height: 80px;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.app-dialog__text {
  line-height: 1.6;
  color: #555;
}

/* Actions */
.app-dialog__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #e9ecef;
  margin-top: 1rem;
}

.app-dialog__action {
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 80px;
  justify-content: center;
  transform: translateY(0);
}

.app-dialog__action:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.app-dialog__action:active:not(:disabled) {
  transform: translateY(0);
  transition: all 0.1s ease;
}

.app-dialog__action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.app-dialog__action--primary {
  background: #42b883;
  color: white;
}

.app-dialog__action--primary:hover:not(:disabled) {
  background: #369870;
}

.app-dialog__action--secondary {
  background: #6c757d;
  color: white;
}

.app-dialog__action--secondary:hover:not(:disabled) {
  background: #5a6268;
}

.app-dialog__action--danger {
  background: #dc3545;
  color: white;
}

.app-dialog__action--danger:hover:not(:disabled) {
  background: #c82333;
}

.app-dialog__action--success {
  background: #28a745;
  color: white;
}

.app-dialog__action--success:hover:not(:disabled) {
  background: #218838;
}

/* Loading spinner */
.app-dialog__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Type-specific styles with enhanced animations */
.app-dialog--error .app-dialog__header {
  border-bottom-color: #dc3545;
}

.app-dialog--error .app-dialog__title {
  color: #721c24;
}

.app-dialog--error.dialog-content-enter-active {
  animation: shake 0.5s ease-in-out;
}

.app-dialog--warning .app-dialog__header {
  border-bottom-color: #ffc107;
}

.app-dialog--warning .app-dialog__title {
  color: #856404;
}

.app-dialog--warning.dialog-content-enter-active {
  animation: bounce-in 0.6s ease-out;
}

.app-dialog--success .app-dialog__header {
  border-bottom-color: #28a745;
}

.app-dialog--success .app-dialog__title {
  color: #155724;
}

.app-dialog--success.dialog-content-enter-active {
  animation: slide-up 0.4s ease-out;
}

.app-dialog--confirm .app-dialog__header {
  border-bottom-color: #17a2b8;
}

.app-dialog--confirm .app-dialog__title {
  color: #0c5460;
}

.app-dialog--confirm.dialog-content-enter-active {
  animation: pulse-in 0.5s ease-out;
}

/* Enhanced animation keyframes */
@keyframes shake {
  0% {
    transform: scale(0.7) translateX(0) translateY(-30px);
    opacity: 0;
  }
  25% {
    transform: scale(0.8) translateX(-5px) translateY(-20px);
    opacity: 0.7;
  }
  50% {
    transform: scale(0.9) translateX(5px) translateY(-10px);
    opacity: 0.9;
  }
  75% {
    transform: scale(0.95) translateX(-2px) translateY(-5px);
    opacity: 0.95;
  }
  100% {
    transform: scale(1) translateX(0) translateY(0);
    opacity: 1;
  }
}

@keyframes bounce-in {
  0% {
    transform: scale(0.7) translateY(-30px);
    opacity: 0;
  }
  30% {
    transform: scale(0.9) translateY(-10px);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.05) translateY(5px);
    opacity: 0.8;
  }
  70% {
    transform: scale(0.98) translateY(-2px);
    opacity: 0.95;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes slide-up {
  0% {
    transform: scale(0.7) translateY(50px);
    opacity: 0;
  }
  50% {
    transform: scale(0.9) translateY(10px);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes pulse-in {
  0% {
    transform: scale(0.6) translateY(-30px);
    opacity: 0;
  }
  30% {
    transform: scale(0.9) translateY(-15px);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.05) translateY(-5px);
    opacity: 0.9;
  }
  70% {
    transform: scale(0.98) translateY(-2px);
    opacity: 0.95;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* Responsive */
@media (min-width: 768px) {
  .app-dialog {
    width: auto;
    min-width: 400px;
  }
}
</style>
