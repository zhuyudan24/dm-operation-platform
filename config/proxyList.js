module.exports = {
  proxyList: {
    '/gic-authcenter/': {
      target: 'https://www.gicdev.com/gic-authcenter',
      changeOrigin: true,
      pathRewrite: {
        '^/gic-authcenter': ''
      }
    },
    '/gic-bizdict/': {
      target: 'https://www.gicdev.com/gic-bizdict',
      changeOrigin: true,
      pathRewrite: {
        '^/gic-bizdict': ''
      }
    }
  }
};
