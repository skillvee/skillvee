// Mock implementation of superjson for Jest tests
module.exports = {
  parse: (data) => JSON.parse(data),
  stringify: (data) => JSON.stringify(data),
  serialize: (data) => ({ json: data, meta: undefined }),
  deserialize: (data) => data.json,
  default: {
    parse: (data) => JSON.parse(data),
    stringify: (data) => JSON.stringify(data),
    serialize: (data) => ({ json: data, meta: undefined }),
    deserialize: (data) => data.json,
  }
};