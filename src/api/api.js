import Vue from 'vue';
// import axios from 'axios';
import qs from 'qs';
import { Message } from 'element-ui';

Vue.axios.defaults.timeout = 15000;
// let protocol = window.location.protocol; // 协议
let local = '';
let localLocal = window.location.origin;
// let host = window.location.host;
if (localLocal.indexOf('gicdev.demogic.com') != -1 || localLocal.indexOf('localhost') != -1) {
  local = 'https://www.gicdev.com';
  // protocol = protocol == 'http:' ? 'https:' : '';
} else {
  local = localLocal;
}
Vue.axios.defaults.withCredentials = true; // 跨域cookie访问

Vue.axios.interceptors.request.use(
  config => {
    return config;
  },
  err => {
    Message.error({ message: '请求超时!' });
    return Promise.resolve(err);
  }
);

Vue.axios.interceptors.response.use(
  data => {
    // log("response data:",data)
    if (data.status && data.status == 200 && data.data.status == 'error') {
      Message.error({ message: data.data.msg });
      return;
    }
    return data;
  },
  err => {
    if (err.response) {
      Message.error({ message: err.response.message });
      if (err.response.status == 504 || err.response.status == 404) {
        // window.location.href= local + "/gic-web/#/"
        // Message.error({message: '服务异常⊙﹏⊙∥'});
      } else if (err.response.status == 403) {
        // window.location.href= local + "/gic-web/#/"
        // Message.error({message: '权限不足,请联系管理员!'});
      } else {
        // window.location.href= local + "/gic-web/#/"
        // Message.error({message: '未知错误!'});
      }
    }
    return Promise.resolve(err);
  }
);

// var localhost = window.location.protocol +'//'+ window.location.host
// log(localhost)

// let base = local + '/gicweb/cloudweb/';
// const timeout = 15000;
// let token = ''; //sessionStorage.getItem('user');

/*
 *
 * 统一 get 请求方法
 * @url: 请求的 url
 * @params: 请求带的参数
 * @header: 带 token
 *
 */

export const getRequest = (url, params) => {
  // params.requestProject = 'middle-ground';
  return Vue.axios({
    method: 'get',
    url: `${local}${url}`,
    data: {},
    params: params,
    headers: { 'content-type': 'application/x-www-form-urlencoded' } // "token": token
  });
};

/*
 *
 * 统一 post 请求方法
 * url: 请求的 url
 * @params: 请求带的参数
 * @header: 带 token
 *
 */

export const postRequest = (url, params) => {
  // params.requestProject = 'middle-ground';
  return Vue.axios({
    method: 'post',
    url: `${local}${url}`,
    data: qs.stringify(params),
    headers: { 'content-type': 'application/x-www-form-urlencoded' }
  });
};

/* 请求头：application/json  带参数 会请求两遍接口 如果不喜欢  可不用*/
export const postJsonRequest = (url, params) => {
  return Vue.axios({
    method: 'post',
    url: `${local}${url}?requestProject=middle-ground`,
    data: params,
    transformRequest: [
      function() {
        return JSON.stringify(params);
      }
    ],
    headers: { 'Content-Type': 'application/json' }
  });
};
/*
 * method: 'post'
 * 'Content-Type': 'application/json;charset=UTF-8'
 * @data: params
 * @requestProject: 'gic-web'
 *
 */
export const postJson = (url, params) => {
  // params.requestProject = "gic-web";
  return Vue.axios({
    method: 'post',
    url: `${local}${url}`,
    data: params,
    params: { requestProject: 'middle-ground' },
    headers: { 'Content-Type': 'application/json;charset=UTF-8' } //multipart/form-data{"token": token}
  });
};

/*
 * method: 'post'
 *  data: params
 *
 */
export const postForm = (url, params) => {
  // params.requestProject = 'middle-ground';
  return Vue.axios({
    method: 'post',
    url: `${local}${url}`,
    data: params,
    // params: params,
    // paramsSerializer: function(params) {
    //   return QS.stringify(params, {arrayFormat: 'brackets'})
    // },
    // transformRequest: [function (data) {
    //   // Do whatever you want to transform the data
    //   log(data)
    //   data = JSON.stringify(data)
    //   return data;
    // }],
    // transformRequest: [
    //   function (data) { // 解决传递数组变成对象的问题
    //     Object.keys(data).forEach((key) => {
    //       if ((typeof data[key]) === 'object') {
    //         data[key] = JSON.stringify(data[key]) // 这里必须使用内置JSON对象转换
    //       }
    //     })
    //     data = qs.stringify(data) // 这里必须使用qs库进行转换
    //     return data
    //   }
    // ],
    headers: {} //'content-type': 'application/x-www-form-urlencoded'multipart/form-data{"token": token}
  });
};
// 新增请求方式  put  delete

export const putRequest = (url, params) => {
  return Vue.axios({
    method: 'put',
    url: `${local}${url}`,
    data: qs.stringify(params)
  });
};

export const deleteRequest = (url, params) => {
  return Vue.axios({
    method: 'delete',
    url: `${local}${url}`,
    data: {},
    params: params
  });
};
