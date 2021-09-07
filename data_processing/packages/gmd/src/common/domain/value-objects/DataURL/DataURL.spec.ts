import {expect} from '@jest/globals'
import {_DataURL, stringToDataURL} from './DataURL'
import {RemoveBrand} from '../../types'

describe('mapDataUri', function() {
  it('Should parse DataURL from a string', function() {
    function test({
      input,
      output,
    }: {
      input: string
      output: RemoveBrand<_DataURL> | undefined
    }) {
      expect(stringToDataURL(input)).toStrictEqual(output)
    }

    test({
      input: 'data:image/svg+xml;charset=UTF-8,some-data',
      output: {
        mimeType: 'image/svg+xml;charset=UTF-8',
        charset: 'charset=UTF-8',
        data: 'some-data',
      },
    })

    test({
      input:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
      output: {
        mimeType: 'image/png',
        charset: '',
        data:
          'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
      },
    })

    test({
      input: 'data:text/plain;charset=utf-8;base64,eWVldA==',
      output: {
        mimeType: 'text/plain;charset=utf-8',
        charset: 'charset=utf-8',
        data: 'eWVldA==',
      },
    })

    test({
      input: ' ',
      output: undefined,
    })

    test({
      input: 'not base64',
      output: undefined,
    })

    test({
      input: 'data:image',
      output: undefined,
    })

    test({
      input: 'U29tZVN0cmluZ09idmlvdXNseU5vdEJhc2U2NEVuY29kZWQ',
      output: undefined,
    })
  })
})
