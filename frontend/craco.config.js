module.exports = {
	webpack: {},
};

// const million = require("million/compiler");

// module.exports = {
//   webpack: {
//     plugins: {
//       add: [million.webpack({ auto: true })],
//     },
//     configure: (webpackConfig, { env, paths }) => {
//       webpackConfig.module.rules.push({
//         test: /\.(js|jsx)$/,
//         exclude: /node_modules/,
//         use: {
//           loader: "babel-loader",
//           options: {
//             presets: ["@babel/preset-env", "@babel/preset-react"],
//             plugins: [
//               [
//                 "@babel/plugin-transform-react-jsx",
//                 { throwIfNamespace: false },
//               ],
//             ],
//           },
//         },
//       });

//       return webpackConfig;
//     },
//   },
//   eslint: {
//     enable: null,
//   },
//   babel: {
//     presets: ["@babel/preset-env", "@babel/preset-react"],
//     plugins: [
//       ["@babel/plugin-transform-react-jsx", { throwIfNamespace: false }],
//     ],
//   },
// };

// const million = require("million/compiler");

// module.exports = {
//   webpack: {
//     plugins: {
//       add: [million.webpack({ auto: true })],
//     },
//     configure: (webpackConfig, { env, paths }) => {
//       const babelLoaderRule = {
//         test: /\.(js|jsx)$/,
//         exclude: /node_modules/,
//         use: {
//           loader: "babel-loader",
//           options: {
//             presets: [
//               ["@babel/preset-env"],
//               ["@babel/preset-react", { runtime: "automatic" }],
//             ],
//             plugins: [
//               [
//                 "@babel/plugin-transform-react-jsx",
//                 { runtime: "automatic", throwIfNamespace: false },
//               ],
//             ],
//           },
//         },
//       };

//       // Find the existing rule for JS/JSX files and modify it
//       webpackConfig.module.rules.push({
//         test: /\.(js|jsx)$/,
//         exclude: /node_modules\/(?!solid-icons)/,
//         use: babelLoaderRule.use,
//       });

//       // Make sure source-map-loader ignores problematic files
//       webpackConfig.module.rules.forEach((rule) => {
//         if (
//           rule.use &&
//           rule.use[0] &&
//           rule.use[0].loader === "source-map-loader"
//         ) {
//           rule.exclude = [/node_modules\/solid-icons/];
//         }
//       });

//       return webpackConfig;
//     },
//   },
//   eslint: {
//     enable: null,
//   },
//   babel: {
//     presets: [
//       ["@babel/preset-env"],
//       ["@babel/preset-react", { runtime: "automatic" }],
//     ],
//     plugins: [
//       [
//         "@babel/plugin-transform-react-jsx",
//         { runtime: "automatic", throwIfNamespace: false },
//       ],
//     ],
//   },
// };
