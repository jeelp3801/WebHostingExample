module.exports = {
    transform: {
      '^.+\\.[tj]sx?$': 'babel-jest', // Transform TS/JS files using babel-jest
    },
    testEnvironment: 'jsdom', // Set the test environment to jsdom
  };
  
