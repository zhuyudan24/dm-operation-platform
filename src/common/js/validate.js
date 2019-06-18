// 手机号验证
export function isvalidPhone(str) {
  const reg = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/;
  return reg.test(str);
}

// 不允许有特殊符号，只能是 数字 字母 下划线 汉字 -
export function isCommonCode(str) {
  const reg = /^[\w\u4e00-\u9fa5-]+$/;
  return reg.test(str);
}

// 不允许有特殊符号，只能是 数字 字母 下划线 汉字 - 可以有空格
export function isCommonCodeSpace(str) {
  const reg = /^[\s\w\u4e00-\u9fa5-]+$/;
  return reg.test(str);
}

// 不允许有特殊符号，只能是 数字 字母 下划线 汉字 - 下划线不在首位
export function isCommonCodeMline(str) {
  // const reg = /^(?!_)(?!.*?_$)[\w\u4e00-\u9fa5-]+$/;  // 下划线不在首尾
  const reg = /^(?!_)[\w\u4e00-\u9fa5-]+$/;
  return reg.test(str);
}
// 不允许有特殊符号，只能是 数字 字母 下划线 汉字 下划线不在首位
export function isCommonCodeLine(str) {
  const reg = /^(?!_)[a-zA-Z0-9\u4e00-\u9fa5_]+$/;
  return reg.test(str);
}
// 只允许有字母、数字 、下划线  下划线不在首位
export function isNumCodeLine(str) {
  const reg = /^(?!_)[a-zA-Z0-9_]+$/;
  return reg.test(str);
}
// 只允许有字母、数字 、下划线
export function isNumLineLetter(str) {
  const reg = /^[a-zA-Z0-9_]+$/;
  return reg.test(str);
}
// 只允许有字母和数字
export function isNumAndCode(str) {
  const reg = /^[a-zA-Z0-9]/;
  return reg.test(str);
}
// 不允许有空格
export function isCommonSpace(str) {
  const reg = /^(?!(\s+$))/;
  return reg.test(str);
}
