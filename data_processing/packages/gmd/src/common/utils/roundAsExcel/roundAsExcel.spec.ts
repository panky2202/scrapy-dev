import {roundAsExcel} from './roundAsExcel'

describe('roundAsExcel', function () {
  it('Should round as excel', function () {
    expect(roundAsExcel(1.0001, 2)).toStrictEqual(1.0)
    expect(roundAsExcel(1.004, 2)).toStrictEqual(1.0)
    expect(roundAsExcel(1.005, 2)).toStrictEqual(1.01)
    expect(roundAsExcel(1.006, 2)).toStrictEqual(1.01)

    expect(roundAsExcel(-1.0001, 2)).toStrictEqual(-1.0)
    expect(roundAsExcel(-1.004, 2)).toStrictEqual(-1.0)
    expect(roundAsExcel(-1.005, 2)).toStrictEqual(-1.01)
    expect(roundAsExcel(-1.006, 2)).toStrictEqual(-1.01)
  })
})
