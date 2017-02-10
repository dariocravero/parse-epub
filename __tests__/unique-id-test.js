import uniqueId from '../unique-id.js';

test('#uniqueId', () => {
  expect(uniqueId()).toEqual('1'); // starts at 1
  expect(uniqueId()).toEqual('2'); // increments on subsequent calls (2)
  expect(uniqueId()).toEqual('3'); // increments on subsequent calls (3)
  expect(typeof uniqueId()).toEqual('string') // returns a string
})
