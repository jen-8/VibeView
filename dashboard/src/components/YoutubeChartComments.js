import React, {useState, useEffect} from "react";

import { BarChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Bar} from 'recharts';
import '../styles/chart.css';
// import data from '../../../json_files/chart_data.json';

const YoutubeChartComments = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        // If you're using Create React App and the file is in the public folder
        fetch('json_files/youtube_chart_comments.json')
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => setData(data))
          .catch(error => console.error('There has been a problem with your fetch operation:', error));
      }, []);

    return <div className="youtube--chart">
        <h3 className="chart--title">Most Liked Topics</h3>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart width={400} height={350} data={data} margin={{top: 10, right: 20, left: 20, bottom: 25}}>
            <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="videoTopic" fontSize={10} label={{ value: 'Video Topic', position: 'bottom'}}/>
                <YAxis label={{value: "Likes", angle:-90, position: 'left'}}/>
                <Tooltip />
                <Bar dataKey="numLikes" fill="#526d82" />
            </BarChart>
        </ResponsiveContainer>
    </div>;
}

export default YoutubeChartComments;