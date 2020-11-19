/**
 * @file Jest config file
 */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['jest-extended'],
    testMatch: [
        '<rootDir>/test/**/?(*.)(spec|test).ts?(x)'
    ]
};
