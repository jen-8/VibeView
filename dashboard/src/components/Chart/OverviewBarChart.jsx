import React, { useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';

const OverviewBarChart = ({ data }) => {
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

  const validData = data?.filter(item => item?.recentIngestedList) ?? [];
  const platforms = ['X', 'YouTube', 'LinkedIn'];
  const platformColors = {X: '#000000',
                          YouTube: '#FF0000',
                          LinkedIn: '#0077B5'}

  const uniqueSentiments = Array.from(new Set(validData.flatMap(platform => platform.recentIngestedList.map(item => item.sentiment)))).sort((a, b) => a - b);

  const series = validData.map((platform, index) => ({
    name: platforms[index % platforms.length],
    type: 'bar',
    data: platform.recentIngestedList.map(item => item.numPosts),
    itemStyle:{
      color: platformColors[platforms[index % platforms.length]]
    }
  }));
  const options = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: validData.map((_, index) => platforms[index % platforms.length]),
      orient: 'vertical',  // Set legend to vertical orientation
      top: 'end',        // Align vertically in the middle
      right: 10,            // Position from the right of the container
      padding: [5, 10]      // Optional padding for aesthetic spacing
    },
    xAxis: {
      type: 'category',
      data: uniqueSentiments.map(String),
      name: 'Sentiment',
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
          color: '#888',
          width: 1.1
        }
      },
      axisLabel: {
        rotate: 0 
      }
    },
    series: series.length > 0 ? series : [{name: 'No Data', data: []}]
  };

  return (
    <ReactECharts 
      ref={echartsRef} 
      option={options} 
      style={{ height: 400 }}
      notMerge={true}
      lazyUpdate={true}
      theme={"theme_name"}
    />
  );
};

export default OverviewBarChart;
