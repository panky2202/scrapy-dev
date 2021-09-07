import {AsyncData} from '../../AsyncDataSource'

export type SortingOrder = 'ascending' | 'descending' | undefined

export type Header = {
  value: string
  sortingOrder?: SortingOrder
  onPress?: () => any
}

export type ColumnBase = {
  header: Header
  alignment: 'left' | 'right'
  width: 'small' | 'regular' | 'big'
}

export type TextColumn<T> = ColumnBase & {
  type: 'text'
  accessor: (row: T) => string | undefined | null
}

type ImageAccessorReturnType =
  | string
  | {
      url: string
      fallbackUrl?: string | null
    }

export type ImageColumn<T> = ColumnBase & {
  type: 'image'
  accessor: (row: T) => ImageAccessorReturnType | undefined | null
}

export type Column<T> = TextColumn<T> | ImageColumn<T>

export type UIAsyncDataTableProps<T> = {
  asyncData: AsyncData<T[]>
  columns: Column<T>[]
  onRowPress?: (row: T) => any
  id?: string
}
