// 时间过滤器
export function dateFormat(timeSpan, format) {
  if (!timeSpan) return;
  timeSpan = timeSpan.toString().length === 10 ? timeSpan * 1000 : timeSpan;
  let date = new Date(timeSpan);
  let o = {
    'M+': date.getMonth() + 1,
    'D+': date.getDate(),
    W: '日一二三四五六'.charAt(date.getDay()),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds()
  };
  if (/(Y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
    }
  }
  return format;
}
