import {useForm} from 'react-hook-form'
import {FormFields, UseUIForm} from './ports/UseUIForm'
import {useCallback} from 'react'

export function useUIForm<T extends FormFields>(params?: {
  defaultValues?: Partial<T>
}): UseUIForm<T> {
  const {register, handleSubmit, formState, reset} = useForm<T>({
    // @ts-ignore
    defaultValues: params?.defaultValues,
  })

  const hs = useCallback(
    (onValid) => handleSubmit((data) => onValid(data)),
    [handleSubmit],
  )

  const r = useCallback(
    (name, options) => {
      const {
        ref,
        onChange,
        onBlur,
        name: regName,
      } = register(name as any, options)
      return {
        ref,
        onBlur,
        name: regName,
        onChange,
      }
    },
    [register],
  )

  const rst = useCallback((params: any) => reset(params), [reset])

  return {
    reset: rst,
    handleSubmit: hs,
    register: r,
    // @ts-ignore
    formState,
  }
}
