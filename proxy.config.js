const proxy = [
/*  {
    context: '/api',
    target: 'http://localhost:8080',
    pathRewrite: {'^/api' : ''}
  }*/
  {
      "/api": {
        "target": "http://localhost:4200/",
        "secure": false,
        "changeOrigin": true
      }
    }
];
module.exports = proxy;
