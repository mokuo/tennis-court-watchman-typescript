const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  preset: "jest-puppeteer",
  moduleFileExtensions: ["js", "jsx", "json", "ts", "tsx"],
  testMatch: [ "**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)" ],
  transform: {
    ...tsjPreset.transform,
  },
};
