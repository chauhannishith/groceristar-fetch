/* global test, describe, it, expect, jest */
const groceristar = require('../groceristar.js')

describe('testing objects inside users', () => {
  // @TODO make users variable export in groceristar.js file
  const users = groceristar.getUsers();

  const userObjectIsValid = property => {
    test(`User object is contain \'${property}\' property in \'String\' type`, () => {
      users.forEach( obj => {
        expect(obj).toHaveProperty(property)
        expect(obj[property]).is(String)
      })
    })
  }

  userObjectIsValid('name')
  userObjectIsValid('email')
  userObjectIsValid('password')
  userObjectIsValid('password')

  // test("each object have property 'email'", () => {
  //   var result = groceristar.getUsers()
  //   result.forEach((obj) => {
  //     expect(obj).toHaveProperty('email')
  //   })
  // })
  //
  // test("each object have property 'password'", () => {
  //   var result = groceristar.getUsers()
  //   result.forEach((obj) => {
  //     expect(obj).toHaveProperty('password')
  //   })
  // })
  //
  // test("objects property 'name' is String", () => {
  //   var result = groceristar.getUsers()
  //   result.forEach((obj) => {
  //     expect(obj).toMatchObject({
  //       name: expect.any(String)
  //     })
  //   })
  // })
  //
  // test("objects property 'email' is String", () => {
  //   var result = groceristar.getUsers()
  //   result.forEach((obj) => {
  //     expect(obj).toMatchObject({
  //       email: expect.any(String)
  //     })
  //   })
  // })
  //
  // test("objects property 'password' is String", () => {
  //   var result = groceristar.getUsers()
  //   result.forEach((obj) => {
  //     expect(obj).toMatchObject({
  //       password: expect.any(String)
  //     })
  //   })
  // })
})
