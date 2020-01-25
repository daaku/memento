import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import PurgecssPlugin from 'purgecss-webpack-plugin';
import appRoot from 'app-root-path';
import fs from 'fs';
// @ts-ignore
import glob from 'glob-all';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CopyPlugin from 'copy-webpack-plugin';

const isProd = process.env.NODE_ENV === 'production';
const mode = isProd ? 'production' : 'development';

// Setting this environment variable enables the bundle analyzer.
const enableAnalyzer = process.env.ENABLE_ANALYZER === '1';

// This allows for configuring a prefix for the static assets.
const publicPath = '';

// This allows for configuring the revision available in TypeScript as __REV__.
let rev: { rev?: string } = {};
const revFile = appRoot.resolve('rev');
if (fs.existsSync(revFile)) {
  rev = JSON.parse(fs.readFileSync(revFile).toString('utf-8'));
}

console.info(`Building in ${mode} mode`);

function isNotNull<T>(it: T): it is NonNullable<T> {
  return it != null;
}

const config: webpack.Configuration = {
  mode,
  devtool: false,
  entry: {
    index: './index.ts',
    style: './style.scss',
  },
  resolve: {
    extensions: ['.ts', '.js', '.scss'],
  },
  performance: {
    assetFilter: function(assetFilename: string): boolean {
      return assetFilename.endsWith('.js') || assetFilename.endsWith('.css');
    },
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif|ttf|otf|svg|webp|eot|woff|woff2)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[sha256:hash:hex:6].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        use: [
          isProd ? null : { loader: 'cache-loader' },
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                target: isProd ? 'es5' : 'esnext',
              },
            },
          },
        ].filter(isNotNull),
      },
      {
        test: /\.(sass|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { sourceMap: true } },
          {
            loader: 'postcss-loader',
            options: { plugins: () => [require('autoprefixer')] },
          },
          { loader: 'resolve-url-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: !isProd,
      __REV__: JSON.stringify(rev.rev || 'development'),
      // eslint-disable-next-line @typescript-eslint/camelcase
      __webpack_public_path__: JSON.stringify(publicPath),
    }),
    enableAnalyzer
      ? new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      : null,
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new CopyPlugin([{ from: 'index.html' }]),
    isProd
      ? new PurgecssPlugin({
          paths: () => {
            return glob.sync(
              [__dirname + '/**/*.ts', __dirname + '/**/*.html'],
              {
                nodir: true,
                ignore: ['node_modules/**'],
              },
            );
          },
        })
      : null,
    new webpack.SourceMapDevToolPlugin({
      append: '\n//# sourceMappingURL=sourcemaps/[file].map',
      filename: 'sourcemaps/[file].map',
    }),
  ].filter(isNotNull),
};

export default config;
