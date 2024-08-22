import React, { useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import '../../styles/content.css';

const TwitterBarChart = ({ data }) => {
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

  const processedData = data.map(item => {
    let sentimentCategory;
    const sentimentValue = parseFloat(item.sentiment);
    if (sentimentValue < -0.25) {
      sentimentCategory = 'negative';
    } else if (sentimentValue > 0.25) {
      sentimentCategory = 'positive';
    } else {
      sentimentCategory = 'neutral';
    }
    return { ...item, sentiment: sentimentCategory };
  });

  const topicCounts = processedData.reduce((acc, item) => {
    acc[item.topic] = (acc[item.topic] || 0) + 1;
    return acc;
  }, {});

  // Sort topics by counts and pick the top 15
  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([topic]) => topic);

  const interactionCategoryCounts = processedData.reduce((acc, item) => {
    const category = item.sentiment;
    if (topTopics.includes(item.topic)) {
      if (!acc[category]) {
        acc[category] = {};
      }
      acc[category][item.topic] = (acc[category][item.topic] || 0) + 1;
    }
    return acc;
  }, {});

  const sentimentCategories = ['positive', 'neutral', 'negative'];

  const series = sentimentCategories.map(category => {
    const categoryData = topTopics.map(topic => interactionCategoryCounts[category] ? interactionCategoryCounts[category][topic] || 0 : 0);
    return {
      name: category,
      type: 'bar',
      stack: 'Ad',
      data: categoryData,
      itemStyle: {
        color: category === 'negative' ? '#D57A7A' :
              category === 'positive' ? '#6CA870' : '#E6B655'
      }
    };
  });

  const options = {
    title: {
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: params => {
        const topic = params[0].axisValueLabel;
        const items = params.map(item => `${item.marker} ${item.seriesName}: ${item.value}`);
        return `<div style="width: auto; min-width: 100px;"><b>${topic}</b><br>${items.join('<br>')}</div>`;
      }
    },
    legend: {
      data: sentimentCategories,
      orient: 'vertical',  // Set legend to vertical orientation
      top: 'end',        // Align vertically in the middle
      right: 10,            // Position from the right of the container
      padding: [5, 10]      // Optional padding for aesthetic spacing
    },
    grid: {
      left: '6%',
      right: '6%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: topTopics.map(topic => topic.length > 15 ? `${topic.slice(0, 12)}...` : topic), // Trim long topics
      name: 'Topic',
      nameLocation: 'middle',
      nameGap: 70,
      axisLabel: {
        rotate: 30,
        interval: 0 // Display every label
      }
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
    series: series
  };

  return <ReactECharts ref={echartsRef} option={options} style={{ height: 400 }} />;
};

export default TwitterBarChart;