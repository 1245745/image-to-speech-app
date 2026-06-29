const config = {
  projectName: 'image-to-speech-app',
  date: '2026-6-27',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: { enable: false }
  },
  cache: {
    enable: false
  },
  mini: {},
  h5: {
    publicPath: './',
    staticDirectory: 'static',
    router: {
      mode: 'hash'
    },
    devServer: {
      port: 10086,
      hot: true
    },
    html: {
      template: './src/index.html'
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}