import { action, computed, observable } from 'mobx';
import omit from 'object.omit';
import queryString from 'query-string';
import store from '../../components/c7n/tools/store';
import axios from '../../components/c7n/tools/axios';
import { handleResponseError } from '../../common';

const ORGANIZATION_TYPE = 'organization';
const PROJECT_TYPE = 'project';

function findDataIndex(collection, value) {
  return collection ? collection.findIndex(
    ({ id, organizationId }) => id === value.id && (
      (!organizationId && !value.organizationId)
      || organizationId === value.organizationId
    ),
  ) : -1;
}

// 保留多少recent内容
function saveRecent(collection = [], value, number) {
  const index = findDataIndex(collection, value);
  if (index !== -1) {
    return collection.splice(index, 1).concat(collection.slice());
  } else {
    collection.unshift(value);
    return collection.slice(0, number);
  }
}

@store('HeaderStore')
class HeaderStore {
  @observable orgData = null;

  @observable proData = null;

  @observable selected = null;

  @observable recentItem = null;

  @observable userPreferenceVisible = false;

  @observable menuTypeVisible = false;

  @observable inboxVisible = false;

  @observable inboxData = [];

  @observable inboxLoaded = false;

  @observable currentMsgType = 'msg';

  @observable announcement = {};

  @observable announcementClosed = true;

  @observable inboxLoading = true;

  @action
  setInboxLoaded(flag) {
    this.inboxLoaded = flag;
  }

  @action
  setInboxLoading(flag) {
    this.inboxLoading = flag;
  }

  @action
  closeAnnouncement() {
    this.announcementClosed = true;
    window.localStorage.setItem('lastClosedId', `${this.announcement.id}`);
  }

  @computed
  get getUnreadAll() {
    return this.inboxData.slice();
  }

  @computed
  get getUnreadMsg() {
    return this.inboxData.filter(v => v.type === 'msg');
  }

  @computed
  get getUnreadNotice() {
    return this.inboxData.filter(v => v.type === 'notice');
  }

  @computed
  get getCurrentMsgType() {
    return this.currentMsgType;
  }

  @action
  setCurrentMsgType(newType) {
    this.currentMsgType = newType;
  }

  @computed
  get getSelected() {
    return this.selected;
  }

  @action
  setSelected(data) {
    this.selected = data;
  }

  @computed
  get getOrgData() {
    return this.orgData;
  }

  @action
  setOrgData(data) {
    this.orgData = data.filter(item => item.enabled === true);
  }

  @computed
  get getProData() {
    return this.proData;
  }

  @action
  setUserPreferenceVisible(userPreferenceVisible) {
    this.userPreferenceVisible = userPreferenceVisible;
  }

  @action
  setMenuTypeVisible(menuTypeVisible) {
    this.menuTypeVisible = menuTypeVisible;
  }

  @action
  setInboxVisible(inboxVisible) {
    this.inboxVisible = inboxVisible;
  }

  axiosGetOrgAndPro(userId) {
    return axios.all([
      axios.get(`/base/v1/users/${userId}/organizations`),
      axios.get(`/base/v1/users/${userId}/projects`),
    ]).then((data) => {
      const [organizations, projects] = data;
      organizations.forEach((value) => {
        value.type = ORGANIZATION_TYPE;
      });
      projects.forEach((value) => {
        value.type = PROJECT_TYPE;
      });
      this.setOrgData(organizations);
      this.setProData(projects);
      return data;
    });
  }

  axiosGetUserMsg(userId) {
    return axios.get(`/notify/v1/notices/sitemsgs?${queryString.stringify({
      user_id: userId,
      read: false,
      page: 1,
      size: 100,
      sort: 'id,desc',
    })}`)
      .then(action(({ list }) => {
        this.inboxData = list || [];
        this.inboxLoading = false;
        this.inboxLoaded = true;
      }))
      .catch(handleResponseError).finally(() => {
        this.inboxLoading = false;
      });
  }

  axiosGetNewSticky() {
    return axios.get('/notify/v1/system_notice/new_sticky').then(action((data) => {
      this.announcement = data;
      if (data && data.id && (!localStorage.lastClosedId || localStorage.lastClosedId !== `${data.id}`)) {
        this.announcementClosed = false;
      }
    })).catch(handleResponseError);
  }

  @action
  setProData(data) {
    this.proData = data.filter(item => item.enabled === true);
  }

  @action
  addProject(project) {
    project.type = PROJECT_TYPE;
    if (this.proData) {
      this.proData.unshift(project);
    } else {
      this.proData = [project];
    }
  }

  @action
  updateProject(project) {
    project.type = PROJECT_TYPE;
    if (this.proData) {
      const index = this.proData.findIndex(({ id }) => id === project.id);
      if (index !== -1) {
        this.proData.splice(index, 1, project);
      }
    }
    this.updateRecentItem(project);
  }

  @action
  addOrg(org) {
    org.type = ORGANIZATION_TYPE;
    if (this.orgData) {
      this.orgData.unshift(org);
    } else {
      this.orgData = [org];
    }
  }

  @action
  updateOrg(org) {
    org.type = ORGANIZATION_TYPE;
    if (this.orgData) {
      const index = this.orgData.findIndex(({ id }) => id === org.id);
      if (index !== -1) {
        this.orgData.splice(index, 1, org);
      }
    }
    this.updateRecentItem(org);
  }

  @computed
  get getRecentItem() {
    let recents = [];
    if (this.recentItem) {
      recents = this.recentItem;
    } else if (localStorage.recentItem) {
      recents = JSON.parse(localStorage.recentItem)
        .map(recent => omit(recent, 'children'));
    }
    return recents.filter(
      (value) => {
        let idx = -1;
        switch (value.type) {
          case ORGANIZATION_TYPE:
            // idx = findDataIndex(this.orgData, value);
            // return idx !== -1 && this.orgData[idx].into;
            return false;
          case PROJECT_TYPE:
            idx = findDataIndex(this.proData, value);
            return idx !== -1;
          default:
            return false;
        }
      },
    );
  }

  @action
  readMsg(userId, data) {
    const body = (data ? [].concat(data) : this.inboxData).map(({ id }) => id);
    this.clearMsg(data);
    return axios.put(`/notify/v1/notices/sitemsgs/batch_read?user_id=${userId}`, JSON.stringify(body));
  }

  @action
  clearMsg(data) {
    if (data) {
      const index = this.inboxData.indexOf(data);
      if (index !== -1) {
        this.inboxData.splice(index, 1);
        this.inboxData = [...this.inboxData];
      }
    } else {
      this.inboxData = [];
    }
  }

  @action
  updateRecentItem(recent) {
    if (recent) {
      const recentItem = JSON.parse(localStorage.recentItem);
      const index = recentItem.findIndex(
        ({ id, organizationId }) => id === recent.id
          && (!organizationId || organizationId === recent.organizationId),
      );
      if (index !== -1) {
        recentItem.splice(index, 1, recent);
        localStorage.recentItem = JSON.stringify(recentItem);
        this.recentItem = recentItem;
      }
    }
  }

  @action
  setRecentItem(recent) {
    if (recent) {
      const recentItem = saveRecent(
        this.getRecentItem,
        omit(recent, 'children'), 10,
      );
      localStorage.recentItem = JSON.stringify(recentItem);
      this.recentItem = recentItem;
    }
  }
}

const headerStore = new HeaderStore();

export default headerStore;
