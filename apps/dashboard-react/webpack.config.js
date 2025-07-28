const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin;

module.exports = {
  entry: './src/index.tsx',
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    port: 3003,
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  },
  output: {
    publicPath: "auto"
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.scss'] // ✅ Suporte a arquivos .scss
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        },
        exclude: /node_modules/
      },
      {
        test: /\.s[ac]ss$/i, // ✅ Arquivos .scss e .sass
        use: [
          'style-loader',     // ✅ Injeta CSS no DOM
          'css-loader',       // ✅ Resolve @import e url()
          'postcss-loader',   // ✅ Opcional (autoprefixer, etc.)
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass') // ✅ Usa Dart Sass
            }
          }
        ]
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'dashboard',
      filename: 'remoteEntry.js',
      exposes: {
        "./Dashboard": "./src/bootstrap.tsx",
        "./MeusCartoes": "./src/pages/meus-cartoes/MeusCartoes.tsx",
        "./Investimentos": "./src/pages/investimentos/Investimentos.tsx",
        "./OutrosServicos": "./src/pages/outros-servicos/OutrosServicos.tsx",
        "./MinhaConta": "./src/pages/minha-conta/MinhaConta.tsx"
      },
      remotes: {},
      shared: {
        react: { singleton: true, eager: false, requiredVersion: '^17.0.2' },
        'react-dom': { singleton: true, eager: false, requiredVersion: '^17.0.2' },
        'react-router-dom': { singleton: true, eager: false }
      }
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ]
};