import { message } from 'choerodon-ui/pro';
import url from 'url';

// 提示错误信息
function prompt(content, type = 'info', duration, placement = 'leftBottom', onClose) {
  const messageType = ['success', 'error', 'info', 'warning', 'warn', 'loading'];
  if (messageType.indexOf(type) !== -1) {
    message[type](content, duration, onClose, placement);
  }
}

// 处理错误相应
function handleResponseError(error) {
  const { response } = error;
  if (response) {
    const { status } = response;
    switch (status) {
      case 400: {
        const mess = response.data.message;
        message.error(mess);
        break;
      }
      default:
        break;
    }
  }
}

// 生成指定长度的随机字符串
function randomString(len = 32) {
  let code = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const maxPos = chars.length;
  for (let i = 0; i < len; i += 1) {
    code += chars.charAt(Math.floor(Math.random() * (maxPos + 1)));
  }
  return code;
}

function historyPushMenu(history, path, domain, method = 'push') {
  method = 'push';
  if (!domain || LOCAL) {
    history[method](path);
  } else if (!path) {
    window.location = `${domain}`;
  } else {
    const reg = new RegExp(domain, 'g');
    if (reg.test(window.location.host)) {
      history[method](path);
    } else {
      window.location = `${domain}/#${path}`;
    }
  }
}

function historyReplaceMenu(history, path, uri) {
  historyPushMenu(history, path, uri, 'replace');
}

function fileServer(path) {
  return url.resolve(FILE_SERVER, path || '');
}

export {
  historyPushMenu,
  historyReplaceMenu,
};
