const path = require('path');

module.exports = {
  target: 'webworker',
  entry: './src/worker.ts',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'worker.js',
    path: path.resolve(__dirname, 'dist'),
  },
  externals: {
    // Cloudflare Workers runtime APIs
    '@cloudflare/workers-types': 'commonjs @cloudflare/workers-types',
  },
};