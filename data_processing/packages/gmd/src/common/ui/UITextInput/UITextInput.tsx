import React, {forwardRef, useEffect, useState} from 'react'
import TextField from '@material-ui/core/TextField'
import {UITextInputProps} from './ports/UITextInputProps'

function WrappedUITextInput(
  {
    onBlur,
    onChange,
    name,
    label,
    value,
    required,
    error,
    disabled,
    id,
  }: UITextInputProps,
  ref: any,
) {
  const [state, setState] = useState<number>(0)

  /*
  This is a hack:
  We need to call re render on TextField,
  So a default input value from React Hook For would be correctly displayed
   */
  useEffect(() => {
    setTimeout(() => setState((x) => x + 1), 500)
  }, [])

  return (
    <TextField
      id={id}
      data-testid={id}
      key={state}
      inputRef={ref}
      required={required}
      onBlur={onBlur}
      label={label}
      disabled={disabled}
      error={Boolean(error)}
      helperText={error}
      name={name}
      value={value}
      onChange={onChange}
      variant="outlined"
    />
  )
}

export const UITextInput = forwardRef(WrappedUITextInput)
