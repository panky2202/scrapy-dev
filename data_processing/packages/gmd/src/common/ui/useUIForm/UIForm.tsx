import React from 'react'

export type UIFormProps = {
  onSubmit: () => any
  children: React.ReactNode
}

export function UIForm({children, onSubmit}: UIFormProps) {
  return <form onSubmit={onSubmit}>{children}</form>
}
