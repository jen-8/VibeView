import React, {useState, useEffect} from "react";
import axios from "axios";
import {ResponsiveContainer} from 'recharts';
import TwitterBarChart from './Chart/TwitterBarChart'
import '../styles/chart.css';
import TwitterSentimentChart from "./Chart/TwitterSentimentChart";
import { IconButton, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import DownloadIcon from '@mui/icons-material/Download';
// import data from '../../../json_files/chart_data.json';

const YoutubeCharts = ({settings}) => {
    const [data, setData] = useState([]);

    useEffect(() => {
      axios.post(`${process.env.REACT_APP_API_BASE_URL}/youtube-chart`, {account: settings["youtubeName"]})
    .then(res => {
      setData(res.data);
    })

  }, [settings]);

  const download = () => {
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "chart_data.json");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  console.log(data[1]);

    // useEffect(() => {
    //     // If you're using Create React App and the file is in the public folder
    //     fetch('json_files/twitter_chart_data.json')
    //       .then(response => {
    //         if (!response.ok) {
    //           throw new Error('Network response was not ok');
    //         }
    //         return response.json();
    //       })
    //       .then(data => setData(data))
    //       .catch(error => console.error('There has been a problem with your fetch operation:', error));
    //   }, []);

    return (
    <div className="charts--container">
      <div className="charts">
        <div className="chart--title">
          <h3>Top Topics</h3>
          <Tooltip title={
              <div>
                <p>Topics are generated from videos by ChatGPT.</p>
                <br/>
                <p>Only the top 15 most common topics are shown.</p>
                <br/>
                <p>Sentiments above 0.25 are considered to be positive, while sentiments below -0.25 are considered to be negative. Sentiments between -0.25 and 0.25 are neutral.</p>
              </div>
            }>
              <IconButton>
                  <InfoIcon/>
              </IconButton>
            </Tooltip>
            <Tooltip title="Download Raw Data">
              <IconButton onClick={download}>
                  <DownloadIcon/>
              </IconButton>
            </Tooltip>
        </div>
          <ResponsiveContainer width="100%" height="100%">
              {data[1] !== undefined ? <TwitterBarChart data={data[1]}/> : <div>Loading...</div>}
              {/* <TwitterBarChart data={data !== undefined ? data[0] : []} /> */}
              {/* <BarChart width={500} height={350} data={data} margin={{top: 10, right: 20, left: 5, bottom: 25}}>
              <CartesianGrid strokeDasharray="3 3" />
                  <XAxis className='xaxis' dataKey="sentiment" label={{ value: 'Sentiment', position: 'bottom'}}/>
                  <YAxis label={{value: "Number of Posts", angle:-90, position: 'leftCenter'}}/>
                  <Tooltip />
                  <Bar dataKey="numPosts" fill="#526d82" />
              </BarChart> */}
          </ResponsiveContainer>
      </div>
      <div className="charts">
        <div className="chart--title">
          <h3>Average Comment Sentiment</h3>
          <Tooltip title= {
            <div>
              <p>Sentiments are calculated from the sum of all of the comments on a video divided by the total number of comments on that video.</p>
              <br/>
              <p>Sentiments are given on a scale from -1 to 1, where 1 is positive and -1 is negative.</p>
            </div>}>
              <IconButton>
                  <InfoIcon/>
              </IconButton>
            </Tooltip>
          <Tooltip title="Download Raw Data">
              <IconButton onClick={download}>
                  <DownloadIcon/>
              </IconButton>
            </Tooltip>
        </div>
          <ResponsiveContainer width="100%" height="100%">
              {data[0] !== undefined ? <TwitterSentimentChart data={data[0]}/> : <div>Loading...</div>}
          </ResponsiveContainer>
      </div>
    </div>
    );
}

export default YoutubeCharts;