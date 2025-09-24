<script setup lang="ts">
import { ref } from 'vue'
import { useDialog } from '@/composables/useDialog'
import UserForm from './UserForm.vue'

defineProps<{
  msg: string
}>()

// New dialog system
const dialog = useDialog()
const lastResult = ref('')

// Dialog system functions
const showAlert = async () => {
  await dialog.alert('This is a simple alert message!', 'Information')
  lastResult.value = 'Alert was acknowledged'
}

const showConfirm = async () => {
  const result = await dialog.confirm(
    'Are you sure you want to delete this item? This action cannot be undone.',
    'Confirm Deletion',
  )
  lastResult.value = `Confirmation result: ${result ? 'Confirmed' : 'Cancelled'}`
}

const showCustomDialog = () => {
  const customDialog = dialog.showComponent(
    UserForm,
    {
      onSubmit: (data: { name: string; email: string; role: string }) => {
        lastResult.value = `User registered: ${JSON.stringify(data, null, 2)}`
        customDialog.hide()
      },
    },
    {
      title: 'Register New User',
      maxWidth: '600px',
    },
  )
  customDialog.show()
}

const showPersistentDialog = () => {
  const persistentDialog = dialog.create({
    title: 'Persistent Dialog',
    content:
      'This dialog cannot be closed by clicking outside or pressing ESC. You must use the close button.',
    persistent: true,
    type: 'warning',
    actions: [
      {
        label: 'Close',
        action: () => {
          persistentDialog.hide()
          lastResult.value = 'Persistent dialog was closed'
        },
        variant: 'primary',
      },
    ],
  })
  persistentDialog.show()
}

const showMultipleDialogs = async () => {
  // Show first dialog
  const firstDialog = dialog.create({
    title: 'First Dialog',
    content: 'This is the first dialog. Click "Next" to open another dialog on top.',
    actions: [
      {
        label: 'Cancel',
        action: () => {
          firstDialog.hide()
          lastResult.value = 'Multiple dialog demo cancelled'
        },
        variant: 'secondary',
      },
      {
        label: 'Next',
        action: () => showSecondDialog(),
        variant: 'primary',
      },
    ],
  })

  const showSecondDialog = () => {
    const secondDialog = dialog.create({
      title: 'Second Dialog',
      content: 'This is the second dialog, opened on top of the first one!',
      type: 'success',
      actions: [
        {
          label: 'Back',
          action: () => {
            secondDialog.hide()
          },
          variant: 'secondary',
        },
        {
          label: 'Finish',
          action: () => {
            secondDialog.hide()
            firstDialog.hide()
            lastResult.value = 'Multiple dialog demo completed successfully'
          },
          variant: 'success',
        },
      ],
    })
    secondDialog.show()
  }

  firstDialog.show()
}

const showAnimationDemo = async () => {
  const types = ['info', 'warning', 'error', 'success', 'confirm'] as const
  let currentIndex = 0

  const showNextDialog = () => {
    if (currentIndex >= types.length) {
      lastResult.value = 'Animation demo completed! All dialog types showcased.'
      return
    }

    const type = types[currentIndex]
    const isLast = currentIndex === types.length - 1

    const demoDialog = dialog.create({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Dialog Animation`,
      content: `This is a ${type} dialog with smooth animations. Notice the unique entrance animation for this dialog type!`,
      type,
      actions: [
        {
          label: isLast ? 'Finish Demo' : 'Next Animation',
          action: () => {
            demoDialog.hide()
            currentIndex++
            if (isLast) {
              lastResult.value = 'Animation demo completed! All dialog types showcased.'
            } else {
              // Small delay to see the exit animation before next dialog
              setTimeout(showNextDialog, 300)
            }
          },
          variant: 'primary',
        },
        {
          label: 'Skip Demo',
          action: () => {
            demoDialog.hide()
            lastResult.value = 'Animation demo skipped.'
          },
          variant: 'secondary',
        },
      ],
    })

    demoDialog.show()
  }

  showNextDialog()
}

// Legacy dialog system (keeping original functionality)
const legacyDialog = ref<HTMLDialogElement | null>(null)
const confirmDialog = ref<HTMLDialogElement | null>(null)
const userAction = ref('')
const actionResult = ref('')

const openDialog = () => {
  legacyDialog.value?.showModal()
}

const closeDialog = () => {
  legacyDialog.value?.close()
}

// Nested dialog functions
const requestAction = (action: string) => {
  userAction.value = action
  confirmDialog.value?.showModal()
}

const confirmAction = () => {
  actionResult.value = `Action "${userAction.value}" was confirmed and executed!`
  confirmDialog.value?.close()
}

const cancelAction = () => {
  actionResult.value = `Action "${userAction.value}" was cancelled.`
  confirmDialog.value?.close()
}

const resetDemo = () => {
  actionResult.value = ''
  userAction.value = ''
}
</script>

<template>
  <div class="greetings">
    <div>Dialog System</div>

    <!-- HTML Dialog Example -->
    <div class="dialog-example system-example">
      <h4>Comprehensive Dialog System</h4>
      <p>This demonstrates the new dialog system with composables and centralized management:</p>

      <div class="dialog-buttons">
        <button @click="showAlert" class="open-dialog-btn">Show Alert</button>
        <button @click="showConfirm" class="open-dialog-btn warning">Show Confirm</button>
        <button @click="showCustomDialog" class="open-dialog-btn info">Show Custom Form</button>
        <button @click="showPersistentDialog" class="open-dialog-btn danger">
          Show Persistent Dialog
        </button>
        <button @click="showMultipleDialogs" class="open-dialog-btn success">
          Show Multiple Dialogs
        </button>
        <button @click="showAnimationDemo" class="open-dialog-btn animated">
          🎬 Animation Demo
        </button>
      </div>

      <div v-if="lastResult" class="system-result">
        <h5>Last Action Result:</h5>
        <pre>{{ lastResult }}</pre>
        <button @click="lastResult = ''" class="clear-btn">Clear</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-examples {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}

/* Dialog Example Styles */
.dialog-example {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.dialog-example h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.open-dialog-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.open-dialog-btn:hover {
  background: #369870;
}

.demo-dialog {
  border: none;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90vw;
}

.demo-dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.dialog-content {
  padding: 2rem;
}

.dialog-content h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  text-align: center;
}

.dialog-content p {
  margin: 0.5rem 0;
  line-height: 1.6;
  color: #555;
}

.dialog-content ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.dialog-content li {
  margin: 0.5rem 0;
  color: #555;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.close-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background: #5a6268;
}

.action-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.action-btn:hover {
  background: #369870;
}

/* Dialog System Styles */
.system-example {
  margin-top: 1rem;
  background: #f8f9ff;
  border: 1px solid #d1ecf1;
}

.system-example h4 {
  color: #0c5460;
}

.dialog-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  width: 100%;
  gap: 1rem;
  margin: 1.5rem 0;
}

.open-dialog-btn.warning {
  background: #ffc107;
  color: #212529;
}

.open-dialog-btn.warning:hover {
  background: #e0a800;
}

.open-dialog-btn.info {
  background: #17a2b8;
  color: white;
}

.open-dialog-btn.info:hover {
  background: #138496;
}

.open-dialog-btn.danger {
  background: #dc3545;
  color: white;
}

.open-dialog-btn.danger:hover {
  background: #c82333;
}

.open-dialog-btn.success {
  background: #28a745;
  color: white;
}

.open-dialog-btn.success:hover {
  background: #218838;
}

.open-dialog-btn.animated {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.open-dialog-btn.animated:hover {
  background: linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.open-dialog-btn.animated:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.open-dialog-btn.animated:hover:before {
  left: 100%;
}

.system-result {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
}

.system-result h5 {
  margin: 0 0 0.5rem 0;
  color: #155724;
}

.system-result pre {
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  margin: 0.5rem 0;
  font-size: 0.9rem;
  overflow-x: auto;
}

.clear-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.clear-btn:hover {
  background: #5a6268;
}

/* Legacy Nested Dialog Styles */
.nested-example {
  margin-top: 1rem;
  background: #f0f8f5;
  border: 1px solid #d4edda;
}

.nested-example h4 {
  color: #155724;
}

/* Main dialog with higher z-index for proper layering */
.main-dialog {
  z-index: 1000;
}

.action-buttons {
  display: grid;
  gap: 1rem;
  margin: 1.5rem 0;
}

.danger-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.danger-btn:hover {
  background: #c82333;
}

.warning-btn {
  background: #ffc107;
  color: #212529;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.warning-btn:hover {
  background: #e0a800;
}

.info-btn {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-btn:hover {
  background: #138496;
}

.action-result {
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
}

.reset-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.reset-btn:hover {
  background: #5a6268;
}

/* Confirmation Dialog Styles */
.confirm-dialog {
  z-index: 1100; /* Higher than main dialog */
  border: 2px solid #ffc107;
}

.confirm-dialog::backdrop {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(3px);
}

.confirm-header {
  text-align: center;
  margin-bottom: 1rem;
}

.confirm-header h3 {
  color: #856404;
  margin: 0;
}

.confirm-details {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 0.75rem;
  margin: 1rem 0;
  font-family: monospace;
}

.warning-text {
  color: #721c24;
  font-weight: 500;
  font-style: italic;
  text-align: center;
}

.confirm-actions {
  justify-content: space-between;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.cancel-btn:hover {
  background: #5a6268;
}

.confirm-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.confirm-btn:hover {
  background: #c82333;
}
</style>
