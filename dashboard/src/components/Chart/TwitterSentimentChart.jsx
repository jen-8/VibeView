import React, { useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';

const TwitterSentimentChart = ({ data }) => {
  const echartsRef = useRef(null);

  useEffect(() => {
    const resizeChart = () => {
      if (echartsRef.current) {
        echartsRef.current.getEchartsInstance().resize();
      }
    };

    window.addEventListener('resize', resizeChart);
    return () => window.removeEventListener('resize', resizeChart);
  }, []);
  
  // const allRatings = [...new Set(data.map(item => parseInt(item['sentiment'])))].sort((a, b) => a - b);
  const allRatings = [...new Set(data.map(item => item['sentiment']))];

  const sentimentCounts = allRatings.map(rating => {
    return data.reduce((acc, item) => {
      if (item['sentiment'] === rating) {
        return acc + item['numPosts'];
      }
      return acc;
    }, 0);
  });

  const series = [
    {
      name: 'Sentiment',
      type: 'bar',
      data: sentimentCounts,
      stack: 'Ad',
      color: '#526D82'
    }
  ];

  const options = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['sentiment'],
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: allRatings.map(String),
      name: 'Average Comment Sentiment',
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      type: 'value',
      name: 'Number of Posts',
      nameLocation: 'middle',
      nameRotate: 90,
      nameGap: 30,
      minInterval: 1,
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.1)',
          type: 'dashed'
        }
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#888', // Set axis line color
          width: 1.1 // Set axis line width to make it bold
        }
      },
      axisLabel: {
        rotate: 0 
      }
    },
    series: series
  };

  return <ReactECharts ref={echartsRef} option={options} style={{ height: 400 }} />;
};

export default TwitterSentimentChart;
