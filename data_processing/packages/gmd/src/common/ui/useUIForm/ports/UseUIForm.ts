import {ChangeHandler} from '../../UITextInput/ports/UITextInputProps'

export type FormFields = Record<string, any>

export type UseUIFormRegister = {
  onChange: (e: any) => void
  name: string
  ref: (instance: any) => void
  onBlur: ChangeHandler
}

export type RegisterOptions = {
  required?: boolean
}

export type FormError = {
  message?: string
}

export type FormState<T extends FormFields> = {
  errors: Record<keyof T, FormError | undefined>
}

export type UseUIForm<T extends FormFields> = {
  reset: (params?: Partial<T>) => void
  formState: FormState<T>
  register: (name: keyof T, options?: RegisterOptions) => UseUIFormRegister
  handleSubmit: (
    onValid: (data: T) => any | Promise<any>,
  ) => (e?: any) => Promise<void>
}
