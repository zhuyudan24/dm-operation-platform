// 环境value
// eslint-disable-next-line
let _isDev = process.env.NODE_ENV === 'development';

import Vue from 'vue';

/**
 * 开发输出log
 * @param {消息} msg
 */
export const log = msg => {
  // eslint-disable-next-line
  if (_isDev && console && console.log) {
    // eslint-disable-next-line
    console.log(msg);
  }
};

/**
 * 补零
 * @param {String/Number} num
 */
export const fillZero = num => {
  num = num * 1;
  if (num < 10) {
    return '0' + num;
  } else {
    return num;
  }
};

/**
 *
 * @param {*时间} date
 * @param {*转换的格式} type
 */
export const formateDateTimeByType = (date, type = 'yyyy-MM-dd-HH-mm-ss') => {
  if (!date) {
    return '';
  }
  if (typeof date === 'number') {
    date = new Date(date);
  }
  if (typeof date === 'string') {
    return date;
  } else {
    let year = type.indexOf('yyyy') >= 0 ? fillZero(date.getFullYear()) : '';
    let month = type.indexOf('MM') >= 0 ? '-' + fillZero(date.getMonth() + 1) : '';
    let day = type.indexOf('dd') >= 0 ? '-' + fillZero(date.getDate()) + '' : '';
    let hours = type.indexOf('HH') >= 0 ? ' ' + fillZero(date.getHours()) : '';
    let min = type.indexOf('mm') >= 0 ? ':' + fillZero(date.getMinutes()) : '';
    let sec = type.indexOf('ss') >= 0 ? ':' + fillZero(date.getSeconds()) : '';
    return year + month + day + hours + min + sec;
  }
};

export const numberToChinese = num => {
  let chnNumChar = {
    零: 0,
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10
  };
  let result = '';
  for (let i in chnNumChar) {
    if (num === chnNumChar[i]) {
      result = i;
    }
  }
  return result;
};

export const numberToWeekChinese = num => {
  let chnNumChar = {
    日: 0,
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6
  };
  let result = '--';
  for (let i in chnNumChar) {
    if (num === chnNumChar[i]) {
      result = i;
    }
  }
  return result;
};

/**
 *
 * @param 清空数据
 */

export const resetParams = obj => {
  for (let item in obj) {
    if (item && obj[item]) {
      switch (obj[item].constructor) {
        case Array:
          obj[item] = [];
          break;
        case String:
          obj[item] = '';
          break;
        case Number:
          obj[item] = 0;
          break;
        case Boolean:
          obj[item] = false;
          break;
        default:
          obj[item] = '';
          break;
      }
    }
  }
};

// 交换数组元素
function swapItems(arr, index1, index2) {
  arr[index1] = arr.splice(index2, 1, arr[index1])[0];
  return arr;
}
// 上移
export const upRecord = function(arr, $index) {
  if ($index == 0) {
    return;
  }
  swapItems(arr, $index, $index - 1);
};
// 下移
export const downRecord = function(arr, $index) {
  if ($index == arr.length - 1) {
    return;
  }
  swapItems(arr, $index, $index + 1);
};

//字符串判断是否为空
export const voidStr = function(str, msg) {
  if (!str) {
    Vue.prototype.$tips({ type: 'warning', message: msg || '内容填写不全' });
    return true;
  } else {
    return false;
  }
};

/**
 * 频率控制 返回函数连续调用时，action 执行频率限定为 次 / delay
 * @param delay  {number}    延迟时间，单位毫秒
 * @param action {function}  请求关联函数，实际应用需要调用的函数
 * @return {function}    返回客户调用函数
 */
export const throttle = function(delay, action) {
  let last = 0;
  return function() {
    let curr = +new Date();
    if (curr - last > delay) {
      action.apply(this, arguments);
      last = curr;
    }
  };
};

/**
 * 验证是否为网址
 */
export const checkUrl = function(urlString) {
  if (urlString != '') {
    let reg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
    if (!reg.test(urlString)) {
      Vue.prototype.$tips({ type: 'warning', message: '网址不规范，示例:http://www.domain.com' });
      return true;
    }
  } else {
    Vue.prototype.$tips({ type: 'warning', message: '网址不规范，示例:http://www.domain.com' });
    return true;
  }
  return false;
};
