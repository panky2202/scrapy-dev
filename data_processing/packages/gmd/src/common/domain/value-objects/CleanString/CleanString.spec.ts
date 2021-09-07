import {cleanString} from './CleanString'

describe('CleanString', function() {
  it('Should trim whitespaces', function() {
    expect(cleanString('  test  ')).toStrictEqual('test')
  })

  it('Should trim html', function() {
    expect(cleanString('  <a>test</a>    <a>test2</a>')).toStrictEqual(
      'test test2',
    )
  })

  it('Should replace new lines with spaces', function() {
    expect(cleanString('text\nanother')).toStrictEqual('text another')
  })

  it('Should normalize unicode', function() {
    expect(cleanString('\xa0 😄 \xc2 \xa0')).toStrictEqual('😄 Â')
  })

  it('Should convert HTML special characters', function() {
    expect(cleanString('hello &amp;&copy;')).toStrictEqual('hello &©')
  })
})
