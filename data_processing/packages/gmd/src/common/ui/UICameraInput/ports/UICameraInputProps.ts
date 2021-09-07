import {ChangeHandler} from '../../UITextInput/ports/UITextInputProps'

export type UICameraInputProps = {
  label?: string
  onChange?: (data: any) => void
  name?: string
  onBlur?: ChangeHandler
  required?: boolean
  error?: string
  disabled?: boolean
  id?: string
}
