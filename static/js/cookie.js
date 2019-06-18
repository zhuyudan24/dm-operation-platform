/*设置cookie*/
export function setCookie(c_name,value,expire) {
  let date=new Date();
  date.setSeconds(date.getSeconds()+expire);
  document.cookie = c_name + "="+ encodeURI(value)+"; expires="+date.toGMTString();
}

/*获取cookie*/
export function getCookie(c_name){
  if(document.cookie.length>0){
    let name = encodeURI(c_name);
    let allcookies = document.cookie;
    name += "=";
    let pos = allcookies.indexOf(name);
    if(pos != -1){
      let start = pos + name.length;
      let end = allcookies.indexOf(";",start);
      if(end == -1){
        end = allcookies.length;
      }
      let value = allcookies.substring(start,end);
      return decodeURI(value);
    } else{
      return "";
    }
  }
}

/*删除cookie*/
export function delCookie(c_name){
  setCookie(c_name, "", -1);
}
