import React, { useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { graphic } from 'echarts';

const OverviewLineChart = (props) => {
  const {
    dataList,
    settings
  } = props;

  const echartsRef = useRef(null);

  let data1 = []; // Twitter
  let data2 = []; // YouTube
  let data3 = []; // LinkedIn

  if(dataList !== undefined){
    dataList.forEach(item => {
      const dayStr = item.date;
      item.twitter_account === settings.twitterName && data1.push([dayStr, item.twitterNumLikes]);
      item.youtube_account === settings.youtubeName && data2.push([dayStr, item.youtubeNumLikes]);
      item.linkedin_account === settings.linkedinName && data3.push([dayStr, item.linkedinNumLikes]);
    });
  }
  useEffect(() => {
    const resizeChart = () => {
      if (echartsRef.current) {
        echartsRef.current.getEchartsInstance().resize();
      }
    };

    window.addEventListener('resize', resizeChart);
    return () => window.removeEventListener('resize', resizeChart);
  }, []);

  const options = {
    title: {
      left: 'center'
    },
    legend: {
      top: 'bottom',
      data: ['Twitter', 'Youtube', 'LinkedIn']
    },
    tooltip: {
      triggerOn: 'none',
      position: function (point, params, dom, rect, size) {
        const x = point[0];
        const margin = 20;
        if (x > size.viewSize[0] - size.contentSize[0] - margin) {
          return [x - size.contentSize[0] - margin, point[1]];
        }
        return [x, point[1]];
      }
    },
    toolbox: {
      left: 'center',
      itemSize: 25,
      top: 55,
      feature: {
      }
    },
    xAxis: {
      type: 'time',
      axisPointer: {
        value: '2016-10-7',
        snap: true,
        lineStyle: {
          color: '#7581BD',
          width: 2
        },
        label: {
          show: true,
          formatter: function (params) {
            const date = new Date(params.value);
              return date.toLocaleDateString('en-CA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              });
          },
          backgroundColor: '#7581BD'
        },
        handle: {
          show: true,
          color: '#7581BD'
        }
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisTick: {
        inside: true
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        inside: true,
        formatter: '{value}\n'
      },
      z: 10
    },
    grid: {
      top: 110,
      left: 15,
      right: 15,
      height: 160
    },
    dataZoom: [
      {
        type: 'inside',
        throttle: 50
      }
    ],
    series: [
      {
        name: 'Twitter',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        sampling: 'average',
        itemStyle: {
          color: '#0770FF'
        },
        stack: 'a',
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(58,77,233,0.8)'
            },
            {
              offset: 1,
              color: 'rgba(58,77,233,0.3)'
            }
          ])
        },
        data: data1
      },
      {
        name: 'Youtube',
        type: 'line',
        smooth: true,
        stack: 'a',
        symbol: 'circle',
        symbolSize: 5,
        sampling: 'average',
        itemStyle: {
          color: '#F2597F'
        },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(213,72,120,0.8)'
            },
            {
              offset: 1,
              color: 'rgba(213,72,120,0.3)'
            }
          ])
        },
        data: data2
      },
      {
        name: 'LinkedIn',
        type: 'line',
        smooth: true,
        stack: 'a',
        symbol: 'circle',
        symbolSize: 5,
        sampling: 'average',
        itemStyle: {
          color: '#558a55'
        },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(122,221,122,0.8)'
            },
            {
              offset: 1,
              color: 'rgba(122,221,122,0.3)'
            }
          ])
        },
        data: data3
      }
    ]
  };

  return <ReactECharts ref={echartsRef} option={options} style={{ height: 400 }} />;
};

export default OverviewLineChart;
 