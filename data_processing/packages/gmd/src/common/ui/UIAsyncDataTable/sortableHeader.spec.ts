import {sortableHeader, SortableVariables} from './sortableHeader'
import assert from 'assert'

type SortKey = 'hello' | 'world'

describe('sortableHeader', function () {
  function test(
    initalState: SortableVariables<SortKey>,
    sortKey: SortKey,
    expectedState: SortableVariables<SortKey>,
  ) {
    const header = sortableHeader({
      variables: initalState,
      setVariables: (variables) =>
        expect(variables).toStrictEqual(expectedState),
    })({
      value: 'any',
      sortKey,
    })

    assert(header.onPress)
    header.onPress()
  }

  it('Should set initial sort state', function () {
    test(
      {
        input: {},
      },
      'hello',
      {
        input: {
          sortKey: 'hello',
          reverse: false,
        },
      },
    )
  })

  it('Should flip sort state', function () {
    test(
      {
        input: {
          sortKey: 'hello',
          reverse: false,
        },
      },
      'hello',
      {
        input: {
          sortKey: 'hello',
          reverse: true,
        },
      },
    )
  })

  it('Should overwrite another sort', function () {
    test(
      {
        input: {
          sortKey: 'world',
          reverse: true,
        },
      },
      'hello',
      {
        input: {
          sortKey: 'hello',
          reverse: false,
        },
      },
    )
  })
})
