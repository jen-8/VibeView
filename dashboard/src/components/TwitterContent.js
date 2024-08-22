import React, {useState, useEffect} from 'react';
// import ContentHeader from './ContentHeader';
import Card from './TwitterCards';
import '../styles/content.css';
import Charts from './TwitterChart';
import PostsList from './TwitterPostsList';
// import TopicList from './TwitterTopicList';
import Recommendations from './TwitterRecommendations';
import axios from "axios";

const ContentBody = ({settings, alreadyScraped, setScraped}) => {
    useEffect( () => {
        axios.post(`${process.env.REACT_APP_API_BASE_URL}/twitter-exists`, {account: settings["twitterName"]})
            .then(res => setScraped(res.data.result))}, [settings, setScraped]);

    if (alreadyScraped)
        return (
        <div>
            <div className='header--cards'>
                <Card settings={settings}/>
                <Recommendations settings={settings}/>
            </div>
            <div className='topic--recommendations'>
                <PostsList settings={settings}/>
            </div>
            <div className='chart--posts'>
                <Charts settings={settings} />
            </div>
        </div>)
    else {
        return (<div>Data not found. Please switch accounts in the settings page, or click the run button above.</div>)
    }
};

const TwitterContent = ({settings}) => {
    const [runningIngestion, setRunning] = useState(false);
    const [alreadyScraped, setScraped] = useState(false);
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
        console.log(settings);
        axios.post(`${process.env.REACT_APP_API_BASE_URL}/twitter-ingestion`, {account: settings["twitterName"], num: settings["twitterPosts"], timezone: settings["timezone"]})
            .then(res => {
                console.log("Done Ingestion");
                setScraped(true);
                setRunning(false);
            })
    }

    return <div className='content'>
        <div className='content--header'>
            <div className='header--title--container'>
                <h1 className='header--title'>X (Twitter) Dashboard</h1>
                {alreadyScraped ? <p>Showing data for <b>@{settings["twitterName"]}</b></p> : <p></p>}
            </div>
            <div className='header--activity'>
                {runningMessage(runningIngestion)}
                <button className='start--button' onClick={runIngestion}>Run X Ingestion and Sentiment Analysis</button>
            </div>
        </div>
        <ContentBody settings={settings} alreadyScraped={alreadyScraped} setScraped={setScraped}/>
    </div>;
};

export default TwitterContent;