import {isValidEmail} from './Email'

describe('isValidEmail', function() {
  it('Should work', function() {
    expect(isValidEmail('hello@world.com')).toBeTruthy()
    expect(isValidEmail('hello@.com')).toBeFalsy()
    expect(isValidEmail('')).toBeFalsy()
  })
})
