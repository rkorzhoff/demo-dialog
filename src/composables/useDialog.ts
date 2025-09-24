import { inject, reactive, computed, markRaw } from 'vue'
import type { DialogOptions, DialogInstance, DialogResult, DialogState } from '@/types/dialog'

// Dialog provider symbol for dependency injection
export const DIALOG_PROVIDER_KEY = Symbol('dialog-provider')

// Dialog store interface
export interface DialogStore {
  dialogs: DialogState[]
  createDialog: (options: DialogOptions) => DialogInstance
  removeDialog: (id: string) => void
  showDialog: (id: string) => void
  hideDialog: (id: string) => void
  hideAllDialogs: () => void
  getDialog: (id: string) => DialogState | undefined
}

// Generate unique ID for dialogs
const generateId = () => `dialog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Create dialog store
export function createDialogStore(): DialogStore {
  const state = reactive({
    dialogs: [] as DialogState[],
  })

  const createDialog = (options: DialogOptions): DialogInstance => {
    const id = options.id || generateId()

    // Remove existing dialog with same ID
    const existingIndex = state.dialogs.findIndex((d) => d.id === id)
    if (existingIndex !== -1) {
      state.dialogs.splice(existingIndex, 1)
    }

    const dialogState: DialogState = {
      id,
      isVisible: false,
      options: {
        showCloseButton: true,
        persistent: false,
        type: 'info',
        ...options,
        id,
      },
    }

    state.dialogs.push(dialogState)

    return {
      id,
      show: () => showDialog(id),
      hide: () => hideDialog(id),
      toggle: () => {
        const dialog = getDialog(id)
        if (dialog?.isVisible) {
          hideDialog(id)
        } else {
          showDialog(id)
        }
      },
      get isVisible() {
        return getDialog(id)?.isVisible || false
      },
      update: (newOptions: Partial<DialogOptions>) => {
        const dialog = getDialog(id)
        if (dialog) {
          Object.assign(dialog.options, newOptions)
        }
      },
    }
  }

  const removeDialog = (id: string) => {
    const index = state.dialogs.findIndex((d) => d.id === id)
    if (index !== -1) {
      state.dialogs.splice(index, 1)
    }
  }

  const showDialog = (id: string) => {
    const dialog = getDialog(id)
    if (dialog) {
      dialog.isVisible = true
    }
  }

  const hideDialog = (id: string) => {
    const dialog = getDialog(id)
    if (dialog) {
      dialog.isVisible = false
      // Clean up promise if exists
      if (dialog.resolve) {
        dialog.resolve(false)
        dialog.resolve = undefined
        dialog.reject = undefined
      }
    }
  }

  const hideAllDialogs = () => {
    state.dialogs.forEach((dialog) => {
      dialog.isVisible = false
      if (dialog.resolve) {
        dialog.resolve(false)
        dialog.resolve = undefined
        dialog.reject = undefined
      }
    })
  }

  const getDialog = (id: string): DialogState | undefined => {
    return state.dialogs.find((d) => d.id === id)
  }

  return {
    dialogs: state.dialogs,
    createDialog,
    removeDialog,
    showDialog,
    hideDialog,
    hideAllDialogs,
    getDialog,
  }
}

// Main composable
export function useDialog() {
  const store = inject<DialogStore>(DIALOG_PROVIDER_KEY)

  if (!store) {
    throw new Error('useDialog must be used within a DialogProvider')
  }

  // Create a new dialog instance
  const create = (options: DialogOptions): DialogInstance => {
    return store.createDialog(options)
  }

  // Show a simple alert dialog
  const alert = (message: string, title = 'Alert'): DialogResult => {
    const dialog = store.createDialog({
      title,
      content: message,
      type: 'info',
      actions: [
        {
          label: 'OK',
          action: () => dialog.hide(),
          variant: 'primary',
        },
      ],
    })

    dialog.show()

    return new Promise((resolve) => {
      const dialogState = store.getDialog(dialog.id)
      if (dialogState) {
        dialogState.resolve = resolve
      }
    })
  }

  // Show a confirmation dialog
  const confirm = (message: string, title = 'Confirm'): DialogResult<boolean> => {
    return new Promise((resolve) => {
      const dialog = store.createDialog({
        title,
        content: message,
        type: 'confirm',
        actions: [
          {
            label: 'Cancel',
            action: () => {
              dialog.hide()
              resolve(false)
            },
            variant: 'secondary',
          },
          {
            label: 'Confirm',
            action: () => {
              dialog.hide()
              resolve(true)
            },
            variant: 'primary',
          },
        ],
      })

      const dialogState = store.getDialog(dialog.id)
      if (dialogState) {
        dialogState.resolve = resolve
      }

      dialog.show()
    })
  }

  // Show a custom component dialog
  const showComponent = (
    component: unknown,
    props: Record<string, unknown> = {},
    options: Partial<DialogOptions> = {},
  ): DialogInstance => {
    return store.createDialog({
      component: component ? markRaw(component as object) : undefined, // Prevent component from being made reactive
      props,
      ...options,
    })
  }

  // Utility functions
  const hideAll = () => store.hideAllDialogs()
  const remove = (id: string) => store.removeDialog(id)

  // Computed properties
  const activeDialogs = computed(() => store.dialogs.filter((d) => d.isVisible))
  const hasActiveDialogs = computed(() => activeDialogs.value.length > 0)

  return {
    // Core functions
    create,
    alert,
    confirm,
    showComponent,
    hideAll,
    remove,

    // State
    dialogs: store.dialogs,
    activeDialogs,
    hasActiveDialogs,

    // Store access (for advanced usage)
    store,
  }
}
