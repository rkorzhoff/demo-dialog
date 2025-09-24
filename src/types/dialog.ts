export interface DialogOptions {
  id?: string
  title?: string
  content?: string
  type?: 'info' | 'warning' | 'error' | 'success' | 'confirm'
  showCloseButton?: boolean
  persistent?: boolean
  maxWidth?: string
  actions?: DialogAction[]
  component?: unknown
  props?: Record<string, unknown>
}

export interface DialogAction {
  label: string
  action: () => void | Promise<void>
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  loading?: boolean
}

export interface DialogState {
  id: string
  isVisible: boolean
  options: DialogOptions
  resolve?: (value: any) => void
  reject?: (reason?: any) => void
}

export interface DialogInstance {
  id: string
  show: () => void
  hide: () => void
  toggle: () => void
  isVisible: boolean
  update: (options: Partial<DialogOptions>) => void
}

export type DialogResult<T = any> = Promise<T>
