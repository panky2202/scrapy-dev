export type KeyboardTypes = 'default' | 'number-pad'

export type ChangeHandler = (event: any) => Promise<void | boolean>

export type UITextInputProps = {
  label?: string
  value?: string
  onChange?: (e: {target: {value: string}}) => void
  name?: string
  onBlur?: ChangeHandler
  required?: boolean
  error?: string
  disabled?: boolean
  id?: string
}
