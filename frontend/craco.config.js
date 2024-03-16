const million = require("million/compiler");

module.exports = {
  webpack: {
    plugins: { add: [million.webpack({ auto: true })] },
  },
  eslint: {
    enable: null,
  },
};
