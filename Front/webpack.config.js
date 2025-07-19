const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/game.ts', // Arquivo de entrada principal
  output: {
    filename: 'bundle.js', // Nome do arquivo de saída
    path: path.resolve(__dirname, 'dist'), // Diretório de saída
  },
  resolve: {
    extensions: ['.ts', '.js'], // Extensões que o Webpack deve resolver
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // Aplica o loader para arquivos .ts
        use: 'ts-loader',
        exclude: /node_modules/, // Exclui a pasta node_modules
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'), // Diretório para servir os arquivos estáticos
    },
    compress: true,
    port: 3000,
  },
};
