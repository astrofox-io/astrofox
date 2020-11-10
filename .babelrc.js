module.exports = function (api) { // Using .babelrc JS example from https://babeljs.io/docs/en/configuration#babelconfigjson
  api.cache(true);

  const ENV = process.env.BABEL_ENV || process.env.NODE_ENV;

  const presets = [
    ["@babel/env", {
      targets: {
        electron: "10.1.5"
      }
    }],
    "@babel/react"
  ];

  const plugins = [
    "@babel/proposal-class-properties",
    "@babel/proposal-object-rest-spread",
    "@babel/proposal-optional-chaining",
    "@babel/proposal-nullish-coalescing-operator",
    "@babel/proposal-export-default-from"
  ];

  if (ENV === 'development') {
    // React Refresh Babel transform should only be enabled in development environment. Will not work in any other
    plugins.push("react-refresh/babel");
  }

  return {
    presets,
    plugins
  };
}
