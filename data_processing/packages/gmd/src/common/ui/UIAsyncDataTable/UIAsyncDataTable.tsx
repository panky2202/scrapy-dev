import React, {SyntheticEvent} from 'react'
import MaterialTable from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import InfiniteScroll from 'react-infinite-scroller'
import {UIHeadline} from '../UITypography'
import {
  ImageColumn,
  TextColumn,
  SortingOrder,
  UIAsyncDataTableProps,
  ColumnBase,
} from './ports/UIAsyncDataTableProps'

function mapSortDirection(direction: SortingOrder): 'asc' | 'desc' | undefined {
  switch (direction) {
    case 'ascending':
      return 'asc'
    case 'descending':
      return 'desc'
  }
}

function UILoadingIndicator() {
  return <>Loading...</>
}

function EmptyCell({column}: {column: ColumnBase}) {
  return <TableCell align={column.alignment} />
}

function TextCell<T>({row, column}: {row: T; column: TextColumn<T>}) {
  const data = column.accessor(row)

  if (!data) {
    return <EmptyCell column={column} />
  }

  return <TableCell align={column.alignment}>{data}</TableCell>
}

export function ImageCell<T>({row, column}: {row: T; column: ImageColumn<T>}) {
  const data = column.accessor(row)

  if (!data) {
    return <EmptyCell column={column} />
  }

  const image =
    typeof data === 'string' ? {url: data} : data

  const handleImageError = image.fallbackUrl
    ? (e: SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.onerror = null
        e.currentTarget.src = image.fallbackUrl ?? ''
      }
    : undefined

  return (
    <TableCell align={column.alignment}>
      <img
        src={image.url}
        onError={handleImageError}
        height={100}
        alt={'table image'}
      />
    </TableCell>
  )
}

export function UIAsyncDataTable<T>({
  id,
  columns,
  onRowPress,
  asyncData: {status, error, data, fetchNext, hasNext},
}: UIAsyncDataTableProps<T>) {
  if (status === 'error') {
    return <UIHeadline>{error}</UIHeadline>
  }

  const header = (
    <TableRow>
      {columns.map((column, columnN) => (
        <TableCell
          key={columnN}
          align={column.alignment}
          sortDirection={mapSortDirection(column.header.sortingOrder)}>
          {column.header.onPress ? (
            <TableSortLabel
              active={Boolean(column.header.sortingOrder)}
              direction={mapSortDirection(column.header.sortingOrder)}
              onClick={column.header.onPress}>
              {column.header.value}
            </TableSortLabel>
          ) : (
            column.header.value
          )}
        </TableCell>
      ))}
    </TableRow>
  )

  const row = (row: T, i: number) => (
    <TableRow key={i} onClick={onRowPress ? () => onRowPress(row) : undefined}>
      {columns.map((column, n) => {
        if (column.type === 'image') {
          return <ImageCell key={n} row={row} column={column} />
        }
        return <TextCell key={n} row={row} column={column} />
      })}
    </TableRow>
  )

  return (
    <InfiniteScroll loadMore={fetchNext} hasMore={hasNext}>
      <Paper>
        <TableContainer>
          <MaterialTable stickyHeader size="small" id={id} data-testid={id}>
            <TableHead>{header}</TableHead>
            <TableBody>{data?.map(row)}</TableBody>
          </MaterialTable>
        </TableContainer>
        {status === 'loading' ? <UILoadingIndicator /> : undefined}
        {!data || data.length === 0 ? <div>No data</div> : undefined}
      </Paper>
    </InfiniteScroll>
  )
}
