import React, { useEffect } from 'react';
import { configure } from 'choerodon-ui';
import { UI_CONFIGURE } from '../../../../common/constants';
import uiAxios from '../../tools/axios/UiAxios';
import OutwardDefault from './OutwardDefault';

const InitUiConfigMaster = ({ AutoRouter }) => {
  useEffect(() => {
    function initUiConfigure() {
      const uiConfigure = UI_CONFIGURE || {};
      configure({
        ...uiConfigure,
        axios: uiAxios,
        dataKey: 'list',
        labelLayout: 'float',
        queryBar: 'bar',
        tableBorder: false,
        lookupAxiosMethod: 'get',
        tableHighLightRow: false,
        tableRowHeight: 32,
        tableColumnResizable: false,
        modalSectionBorder: false,
        modalOkFirst: false,
        buttonFuncType: 'flat',
        // generatePageQuery: ({ page, pageSize, sortName, sortOrder }) => ({
        //   page: page - 1,
        //   size: pageSize,
        //   sort: sortName && (sortOrder ? `${sortName},${sortOrder}` : sortName),
        // }),
      });
    }

    initUiConfigure();
  }, []);

  return (
    <OutwardDefault
      AutoRouter={AutoRouter}
    />
  );
};

export default InitUiConfigMaster;