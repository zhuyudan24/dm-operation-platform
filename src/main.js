import 'babel-polyfill';
import es6promise from 'es6-promise';
es6promise.polyfill();
import Vue from 'vue';
import App from './App';
import router from './router';
import ElementUI from 'element-ui';
import VueAxios from 'vue-axios';
import axios from 'axios';
import store from './store/store'; // 状态管理器 vuex

import '../static/css/public.css'; // 公用样式
import 'element-ui/lib/theme-chalk/index.css'; // elementUI的样式
import '../static/font/iconfont.css'; // iconfont
import '../theme/index.css'; // 新主题
import * as dateFilter from './common/js/dateFilter.js';

Vue.config.productionTip = false;

Vue.use(ElementUI);
Vue.use(VueAxios, axios);

// 注册一个全局自定义指令 `v-focus`
Vue.directive('focus', function(el) {
  el.querySelector('input').focus();
});
// 全局注册过滤器
Object.keys(dateFilter).forEach(key => {
  Vue.filter(key, dateFilter[key]);
});

Vue.prototype.axios.withCredentials = true; // 跨域cookie访问

window.$bus = new Vue(); // 全局事件

// Vue.axios.defaults.baseURL =  process.env['NODE_ENV'] === 'development' ? 'http://gicdev.demogic.com' : 'https://hope.demogic.com/';
Vue.axios.interceptors.request.use(
  config => {
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);
Vue.axios.interceptors.response.use(
  response => {
    if (response.status == 200) {
      if (response.data.errorCode == 4002 || response.data.errorCode == 4011) {
        // 加上登录页
        window.location.href = window.location.origin + '/operation-platform/#/';
      }
    }
    return response;
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          if (error.response.data.errorCode == 4011) {
            ElementUI.MessageBox.confirm(error.response.data.message, '提示', {
              confirmButtonText: '知道了',
              showCancelButton: false,
              type: 'warning'
            })
              .then(_ => {
                window.location.href = window.location.origin + '/operation-platform/#/';
              })
              .catch(() => {});
          } else {
            // 加上登录页
            window.location.href = window.location.origin + '/operation-platform/#/';
          }
          break;
        case 403:
          if (error.response.data.errorCode == 4004) {
            ElementUI.Message.error(error.response.data.message);
          }
          break;
      }
    }
    return Promise.reject(error.response.status.toString());
  }
);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
});
