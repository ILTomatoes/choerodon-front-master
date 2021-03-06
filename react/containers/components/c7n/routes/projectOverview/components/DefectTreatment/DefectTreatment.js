import React, { useState, memo, useMemo, useEffect } from 'react';
import { Button, Tooltip } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import Echart from 'echarts-for-react';
import './index.less';
import { Spin } from 'choerodon-ui';
import LoadingBar from '@/containers/components/c7n/tools/loading-bar';
import OverviewWrap from '../OverviewWrap';
import { useDefectTreatmentStore } from './stores';
import { useProjectOverviewStore } from '../../stores';
import EmptyPage from '../EmptyPage';

const DefectTreatment = observer(() => {
  const options = useMemo(() => [{ value: 'created', text: '提出' }, { value: 'completed', text: '解决' }], []);
  const clsPrefix = 'c7n-project-overview-defect-treatment';
  const { defectTreatmentStore, showDevops } = useDefectTreatmentStore();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [charOption, setCharOption] = useState('created'); // createdList completedList
  const { projectOverviewStore } = useProjectOverviewStore();

  useEffect(() => {
    if (projectOverviewStore.getStaredSprint) {
      setLoading(true);
      defectTreatmentStore.axiosGetChartData(projectOverviewStore.getStaredSprint.sprintId).then(() => {
        setLoading(false);
      });
    } else if (projectOverviewStore.getIsFinishLoad) {
      setLoading(false);
    }
  }, [projectOverviewStore.getIsFinishLoad]);
  useEffect(() => {
    if (defectTreatmentStore.getChartList && defectTreatmentStore.getChartList.length > 8) {
      setShow(true);
    }
  }, [defectTreatmentStore.getChartList]);
  function getOptions() {
    return {
      legend: {
        // type: 'roundRect',
        zlevel: 5,
        icon: 'path://m 7.25,0.018229 h 5.5 c 3.878,0 7,2.1928333 7,4.9166665 0,2.7238333 -3.122,4.9166665 -7,4.9166665 h -5.5 c -3.878,0 -7,-2.1928332 -7,-4.9166665 0,-2.7238332 3.122,-4.9166665 7,-4.9166665 z',
        itemWidth: 20,
        itemHeight: 10,
        borderRadius: 20,
        top: '-4px',
        right: 8,
      },
      grid: {
        left: 30,
        right: 8,
        // top: 37,
        bottom: show ? 61 : 35,
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.75)',
        textStyle: {
          color: '#FFF',
        },
      },
      dataset: {
        source: defectTreatmentStore.getChartList ? defectTreatmentStore.getChartList : [],
      },
      xAxis: {
        type: 'category',
        axisTick: { show: false },
        interval: 0,
        axisLine: {
          show: false,
          lineStyle: {
            color: '#eee',
          },
          onZero: true,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 12,
            fontStyle: 'normal',
          },
        },
      },
      yAxis: {
        name: '问题计数',
        nameTextStyle: {
          color: '#000',
        },
        nameGap: 23,
        axisTick: { show: false },
        axisLine: {
          show: false,

        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(238, 238, 238, 1)',
          },
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 12,
            fontStyle: 'normal',
          },
        },
      },

      series: [
        {
          type: 'bar',
          // color: 'green',
          name: charOption === 'created' ? '提出' : '解决',
          color: charOption === 'created' ? 'rgba(249, 136, 148, 1)' : 'rgba(136, 223, 240, 1)',
          barWidth: 10,
          itemStyle: {
            barBorderRadius: [5, 5, 0, 0],
          },
          dimensions: [
            { name: 'worker', type: 'ordinal' },
            { name: charOption, type: 'number' },
          ],
        },
      ],
      dataZoom: [{
        bottom: 18,
        show,
        type: 'slider',
        height: 15,
        width: '80%',
        left: 60,
        startValue: 0,
        endValue: 7,
        zoomLock: true,
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '100%',
        handleStyle: {
          color: '#fff',
          borderType: 'dashed',
          shadowBlur: 4,
          shadowColor: 'rgba(0, 0, 0, 0.6)',
          shadowOffsetX: 2,
          shadowOffsetY: 2,
        },

      }],
    };
  }
  const renderTitle = () => (
    <div className={`${clsPrefix}-title`}>
      <span>缺陷提出与解决</span>
      {projectOverviewStore.getStaredSprint && defectTreatmentStore.getChartList && defectTreatmentStore.getChartList.length > 0 ? <OverviewWrap.Switch defaultValue="created" onChange={setCharOption} options={options} /> : ''}
    </div>
  );
  function render() {
    if (projectOverviewStore.getStaredSprint) {
      return (
        <OverviewWrap.Content className={`${clsPrefix}-content`}>
          <Spin spinning={loading}>
            {
              defectTreatmentStore.getChartList && !loading && defectTreatmentStore.getChartList.length > 0
                ? <Echart style={{ width: '100%', height: showDevops ? '300px' : '380px' }} option={getOptions()} /> : <EmptyPage height={274} content="暂无数据" />
            }

          </Spin>
        </OverviewWrap.Content>
      );
    } else if (projectOverviewStore.getIsFinishLoad) {
      return <EmptyPage />;// 暂无活跃的冲刺" 
    }
    return <LoadingBar display />;
  }
  return (
    <OverviewWrap height={showDevops ? 348 : 428}>
      <OverviewWrap.Header title={renderTitle()} />

      {render()}

    </OverviewWrap>

  );
});

export default DefectTreatment;
