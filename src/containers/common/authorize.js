import { ACCESS_TOKEN, AUTH_HOST, AUTH_URL } from './constants';
import { getCookieToken, removeAccessToken } from './accessToken';

export function authorize() {
  window.top.location = `${AUTH_URL}`;
}

export function logout() {
  const token = getCookieToken();
  let logoutUrl = `${AUTH_HOST}/logout`;
  if (token) {
    logoutUrl += `?${ACCESS_TOKEN}=${getCookieToken()}`;
  }
  removeAccessToken();
  localStorage.clear();
  sessionStorage.clear();
  window.location = logoutUrl;
}

export function authorizeC7n() {
  // 为了把这个hash传到oauth里要把#换成%23
  const uri = escape(window.location.href);
  window.localStorage.removeItem('lastClosedId');
  // 这里是为了告诉oauth我要重定向的uri是什么，必须和client中对应，跳转到非client的页面会报错。
  if (window.location.href.indexOf('#') === -1) {
    window.location = `${AUTH_URL}&redirect_uri=${uri}`;
  } else if (window.location.href.indexOf('?') === -1) {
    window.location = `${AUTH_URL}&redirect_uri=${uri}%3FredirectFlag`;
  } else {
    window.location = `${AUTH_URL}&redirect_uri=${uri}%26redirectFlag`;
  }
}

/**
 * 登出
 */
export function logoutC7n() {
  const token = getCookieToken();
  let logoutUrl = `${AUTH_HOST}/logout`;
  if (token) {
    logoutUrl += `?${ACCESS_TOKEN}=${getCookieToken()}`;
  }
  removeAccessToken();
  window.localStorage.removeItem('lastClosedId');
  sessionStorage.clear();
  window.location = logoutUrl;
}
