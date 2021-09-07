import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {UIAsyncDataTable} from './UIAsyncDataTable'
import {ImageColumn, TextColumn} from './ports/UIAsyncDataTableProps'

describe('UIAsyncDataTable', function () {
  it('Should render ImageCell with url and backup url', function () {
    type GenericImageRow = {
      image: {
        url: string
        fallbackUrl: string
      }
    }

    const column: ImageColumn<GenericImageRow> = {
      accessor: (container: any) => ({
        url: container.image?.url ?? '',
        fallbackUrl: container.image?.fallbackUrl ?? '',
      }),
      header: {
        value: 'Image',
      },
      alignment: 'left',
      width: 'regular',
      type: 'image',
    }

    const row = {
      image: {
        url: 'https://www.gmd.com/test.jpg',
        fallbackUrl: 'https://www.gmd.com/backupurl.jpg',
      },
    }

    render(
      <UIAsyncDataTable
        asyncData={{
          status: 'success',
          hasNext: false,
          fetchNext: jest.fn(),
          data: [row],
          error: '',
        }}
        columns={[column]}
      />,
    )

    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveProperty('src', row.image.url)
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByRole('img')).toHaveProperty('src', row.image.fallbackUrl)
  })

  it('Should render Cell', function () {
    const column: TextColumn<any> = {
      accessor: (container) => container.data,
      header: {
        value: 'Value',
      },
      alignment: 'left',
      width: 'regular',
      type: 'text',
    }

    const data = 'sample data'
    const row = {
      data,
    }

    render(
      <UIAsyncDataTable
        asyncData={{
          status: 'success',
          hasNext: false,
          fetchNext: jest.fn(),
          data: [row],
          error: '',
        }}
        columns={[column]}
      />,
    )
    expect(screen.getByText(data)).toBeInTheDocument()
    expect(screen.getByRole('cell')).toHaveTextContent(data)
  })
})
