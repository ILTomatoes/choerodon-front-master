import React, { useState } from 'react';
import classnames from 'classnames';
import { Button, Icon } from 'choerodon-ui';
import { Form, TextField, TextArea, Select } from 'choerodon-ui/pro';
import { FormattedMessage } from 'react-intl';
import AvatarUploader from './components/avatarUploader';
import { fileServer } from '../../../../common';

export default function FormView({ context }) {
  const { dataSet, AppState, intl } = context;
  const [isShowAvatar, setIsShowAvatar] = useState(false);

  function openAvatarUploader() {
    setIsShowAvatar(true);
  }

  function closeAvatarUploader() {
    setIsShowAvatar(false);
  }

  function handleUploadOk(res) {
    const record = dataSet.current;
    record.set('imgUrl', res);
    closeAvatarUploader();
  }

  function renderAvatar() {
    const record = dataSet.current;
    const name = record.get('name');
    const imageUrl = record.get('imgUrl');
    return (
      <React.Fragment>
        <div className="c7n-iam-projectsetting-avatar">
          <div
            className="c7n-iam-projectsetting-avatar-wrap"
            style={{
              backgroundColor: '#c5cbe8',
              backgroundImage: imageUrl ? `url(${fileServer(imageUrl)})` : '',
            }}
          >
            {!imageUrl && name && name.charAt(0)}
            <Button
              className={classnames('c7n-iam-projectsetting-avatar-button', 'c7n-iam-projectsetting-avatar-button-edit')}
              onClick={openAvatarUploader}
            >
              <div className="c7n-iam-projectsetting-avatar-button-icon">
                <Icon type="photo_camera" />
              </div>
            </Button>
            <AvatarUploader
              AppState={AppState}
              intl={intl}
              visible={isShowAvatar}
              intlPrefix="organization.project.avatar.edit"
              onVisibleChange={closeAvatarUploader}
              onUploadOk={handleUploadOk}
            />
          </div>
        </div>
        <div style={{ margin: '.06rem 0 .2rem 0', textAlign: 'center' }}>项目logo</div>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      {renderAvatar()}
      <Form record={dataSet.current}>
        <TextField name="name" />
        <TextField name="code" disabled />
        <Select name="category" disabled />
        <TextField name="creationDate" disabled />
        <TextField name="createBy" disabled />
      </Form>
    </React.Fragment>
  );
}
