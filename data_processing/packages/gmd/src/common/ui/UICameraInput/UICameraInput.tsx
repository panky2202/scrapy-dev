import React, {forwardRef} from 'react'
import {UICameraInputProps} from './ports/UICameraInputProps'
import {UIText} from '../UITypography'
import {UISpacer} from '../UISpacer'
import {UIError} from '../UITypography/UIError'

function WrappedUICameraInput(
  {
    label,
    onChange,
    name,
    onBlur,
    required,
    error,
    disabled,
    id,
  }: UICameraInputProps,
  ref: any,
) {
  return (
    <>
      <UIText>
        {label}
        {required ? ' *' : ''}
      </UIText>
      <UISpacer size="small" />
      <input
        id={id}
        data-testid={id}
        disabled={disabled}
        type="file"
        accept="image/*;capture=camera"
        onChange={onChange}
        name={name}
        ref={ref}
        required={required}
        onBlur={onBlur}
      />
      {error && <UIError>{error}</UIError>}
    </>
  )
}

export const UICameraInput = forwardRef(WrappedUICameraInput)
