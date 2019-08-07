import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router';
import { Button, Icon } from 'choerodon-ui';
import MenuType from './MenuType';
import Logo from './Logo';
import Setting from './Setting';
import User from './User';
import Inbox from './Inbox';
import HeaderSetting from './HeaderSetting';
import Favorites from '../favorites';
import './style';
import OrgSelect from './OrgSelect';

const prefixCls = 'c7n-boot-header';

@withRouter
@inject('AppState', 'HeaderStore', 'MenuStore')
@observer
class Header extends Component {
  componentDidMount() {
    const { AppState, HeaderStore, MenuStore } = this.props;
    MenuStore.loadMenuData({ type: 'site' }, false);
    HeaderStore.axiosGetOrgAndPro(AppState.getUserId);
  }

  componentWillReceiveProps(nextProps) {
    const { getUserId } = this.props.AppState;
    localStorage.setItem(`historyPath-${getUserId}`, nextProps.location.pathname + nextProps.location.search);
  }

  handleGuideClick() {
    const { AppState } = this.props;
    AppState.setGuideExpanded(!AppState.getGuideExpanded);
  }

  render() {
    const { AppState: { getUserInfo: { image_url: imgUrl } }, MenuStore: { getSiteMenuData }, history } = this.props;
    return (
      <div className={`${prefixCls}-wrap`}>
        <div className={`${prefixCls}-left`}>
          <Logo history={history} />
        </div>
        <ul className={`${prefixCls}-center`}>
          <li><HeaderSetting /></li>
          {/* <li>
            <MenuType />
          </li> */}
        </ul>
        <ul className={`${prefixCls}-right`}>
          {/* <li>
            <Favorites />
          </li>
          <li>
            <Button functype="flat" shape="circle" onClick={() => this.handleGuideClick()}>
              <Icon type="school" />
            </Button>
          </li> */}
          <li style={{ width: 'auto' }}>
            <OrgSelect />
          </li>
          {
            getSiteMenuData.length > 0 && (
              <li style={{ width: 'auto' }}>
                <Setting />
              </li>
            )
          }
          <li style={{ width: 'auto' }}>
            <div>
              <Button functype="flat" shape="circle" onClick={() => this.handleGuideClick()}>
                <Icon type="help" />
              </Button>
            </div>
          </li>
          <li style={{ width: 'auto' }}>
            {/* <Inbox /> */}
          </li>
          <li style={{ marginLeft: 20 }}>
            <User imgUrl={imgUrl} />
          </li>
        </ul>
      </div>
    );
  }
}

export default Header;
