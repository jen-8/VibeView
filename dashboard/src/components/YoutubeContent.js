import React, {useState, useEffect} from 'react';
// import ContentHeader from './ContentHeader';
import Card from './YoutubeCards';
import '../styles/content.css';
// import YoutubeChartComments from './YoutubeChartComments';
import Recommendations from './YoutubeRecommendations';
import YoutubeVideoList from './YoutubeVideoList';
import axios from 'axios';
import YoutubeCharts from './YoutubeChart';

const ContentBody = ({settings, alreadyScraped, setScraped}) => {
    useEffect( () => {
        axios.post(`${process.env.REACT_APP_API_BASE_URL}/youtube-exists`, {account: settings["youtubeName"]})
            .then(res => setScraped(res.data.result))}, [settings, setScraped]);

    if (alreadyScraped)
        return (
        <div>
            <div className='header--cards'>
                <Card settings={settings}/>
                <Recommendations settings={settings}/>
            </div>
            <div className='topic--recommendations'>
                <YoutubeVideoList settings={settings}/>
            </div>
            <div className='chart--posts'>
                <YoutubeCharts settings={settings} />
            </div>
            
        </div>)
    else {
        return (<div>Data not found. Please switch accounts in the settings page, or click the run button above.</div>)
    }
};

const YoutubeContent = (props) => {
    const {
        settings,
        youtubeChannel
      } = props

    const [runningIngestion, setRunning] = useState(false);
    const [alreadyScraped, setScraped] = useState(false);

    console.log(youtubeChannel);
    // const [topTopic, setTopTopic] = useState("");

    const runningMessage = (runningIngestion) => {
        if (runningIngestion) {
            return <div>loading...</div>
        } else {
            return 
        }
    } 
    const runIngestion = () => {
        console.log("Starting Ingestion");
        setRunning(true);
        axios.post(`${process.env.REACT_APP_API_BASE_URL}/youtube-ingestion`, {account: settings["youtubeName"], num: settings["youtubePosts"]})
            .then(res => {
                console.log("Done Ingestion");
                setScraped(true);
                setRunning(false);
            })
    }

    return <div className='content'>
        <div className='content--header'>
            <div className='header--title--container'>
                <h1 className='header--title'>YouTube Dashboard</h1>
                {alreadyScraped ? <p>Showing data for channel <b>{youtubeChannel}</b></p> : <p></p>}
            </div>
            <div className='header--activity'>
                {runningMessage(runningIngestion)}
                <button className='start--button' onClick={runIngestion}>Run YouTube Ingestion and Sentiment Analysis</button>
            </div>
        </div>
        <ContentBody settings={settings} alreadyScraped={alreadyScraped} setScraped={setScraped}/>
    </div>;
};

export default YoutubeContent;