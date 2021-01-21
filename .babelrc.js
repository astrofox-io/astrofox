module.exports = function (api) {
  api.cache(true);

  const ENV = process.env.BABEL_ENV || process.env.NODE_ENV;

  const presets = [
    [
      '@babel/env',
      {
        targets: {
          electron: '11.1.1',
        },
      },
    ],
    '@babel/react',
  ];

  const plugins = [
    '@babel/proposal-class-properties',
    '@babel/proposal-object-rest-spread',
    '@babel/proposal-optional-chaining',
    '@babel/proposal-nullish-coalescing-operator',
    '@babel/proposal-export-default-from',
  ];

  if (ENV === 'development') {
    plugins.push('react-refresh/babel');
  }

  return {
    presets,
    plugins,
  };
};
