import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getCookie } from '../../../../common';

export default class WSHandler extends Component {
  static defaultProps = {
    path: `choerodon:msg?token=bearer ${getCookie('access_token')}`,
  };

  static propTypes = {
    messageKey: PropTypes.string.isRequired,
    path: PropTypes.string, // 能从Provider获得指定path的连接
    autoReconnect: PropTypes.bool, // 在WebSocket连接断开后要能自动重连
    onMessage: PropTypes.func,
    onCreate: PropTypes.func,
    onClose: PropTypes.func,
    onError: PropTypes.func,
    onRetry: PropTypes.func,
  };

  static contextTypes = {
    ws: PropTypes.object,
  };

  state = {
    key: null,
  };

  componentWillMount() {
    this.register(this.props, this.context);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.messageKey !== this.props.messageKey) {
      this.unregister(this.props, this.context);
      this.register(nextProps, nextContext);
    }
  }

  componentWillUnmount() {
    this.unregister(this.props, this.context);
  }

  handleMessage = (data) => {
    const { onMessage } = this.props;
    if (typeof onMessage === 'function') {
      onMessage(JSON.parse(data).key);
    }
    this.setState({
      key: JSON.parse(data).key,
    });
  };

  register(props, context) {
    const { messageKey, path } = props;
    const { ws } = context;
    if (ws) {
      ws.register(messageKey, { type: 'notify', key: messageKey }, this.handleMessage, path);
    }
  }

  unregister(props, context) {
    const { messageKey, path } = props;
    const { ws } = context;
    if (ws) {
      ws.unregister(messageKey, this.handleMessage, path);
    }
  }

  render() {
    const { key } = this.state;
    const { children } = this.props;
    if (typeof children === 'function') {
      return children(key);
    } else {
      return children;
    }
  }
}
