module.exports = {
  extends: ['daaku'],
  env: {
    jest: true,
  },
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['*/__tests__/*', 'webpack.config.ts'],
      },
    ],
  },
};
