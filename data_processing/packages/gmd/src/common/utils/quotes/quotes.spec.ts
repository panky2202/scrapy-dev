import {range} from 'lodash'
import {DateTypeSchema} from '../../domain/value-objects'
import {
  motivationalQuoteOfADay,
  ofADay,
  randomLearnFromFailureQuote,
} from './quotes'

describe('quotes', function () {
  it('Should support ofADay', function () {
    range(0, 60).forEach((i) => {
      const date = new Date()
      date.setDate(i)
      expect(ofADay([1, 2, 3, 4, 5, 6], DateTypeSchema(date))).toBeTruthy()
    })
  })

  it('Should support motivationalQuoteOfADay', function () {
    expect(motivationalQuoteOfADay()).toBeTruthy()
  })

  it('Should support randomLearnFromFailureQuote', function () {
    range(0, 60).forEach(() => {
      expect(randomLearnFromFailureQuote()).toBeTruthy()
    })
  })
})
