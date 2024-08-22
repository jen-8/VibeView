import React, {useState, useEffect} from 'react';
// import ContentHeader from './ContentHeader';
import '../styles/content.css';
import axios from "axios";
import LinkedinCards from './LinkedinCards';
import LinkedinCharts from './LinkedinChart';
import LinkedinPostsList from './LinkedinPostsList';
import LinkedinRecommendations from './LinkedinRecommendation';

const ContentBody = ({settings, alreadyScraped, setScraped}) => {
    useEffect( () => {
        axios.post(`${process.env.REACT_APP_API_BASE_URL}/linkedin-exists`, {account: settings["linkedinName"]})
            .then(res => setScraped(res.data.result))}, [settings, setScraped]);
    if (alreadyScraped)
        return (
            <div>
                <div className='header--cards'>
                    <LinkedinCards settings={settings}/>
                    <LinkedinRecommendations settings={settings}/>
                </div>
                <div className='topic--recommendations'>
                    <LinkedinPostsList settings={settings}/>
                </div>
                <div className='chart--posts'>
                    <LinkedinCharts settings={settings} />
                </div>
            </div>)
    else {
        return (<div>Data not found. Please switch accounts in the settings page, or click the run button above.</div>)
    }
};

const LinkedinContent = ({settings}) => {
    const [runningIngestion, setRunning] = useState(false);
    const [alreadyScraped, setScraped] = useState(false);

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
        axios.post(`${process.env.REACT_APP_API_BASE_URL}/linkedin-ingestion`, {account: settings["linkedinName"], num: settings["linkedinPosts"]})
            .then(res => {
                console.log("Done Ingestion");
                setScraped(true);
                setRunning(false);
            })
    }

    return <div className='content'>
        <div className='content--header'>
            <div className='header--title--container'>
                <h1 className='header--title'>LinkedIn Dashboard</h1>
                {alreadyScraped ? <p>Showing data for <b>{settings["linkedinName"]}</b></p> : <p></p>}
            </div>
            <div className='header--activity'>
                {runningMessage(runningIngestion)}
                <button className='start--button' onClick={runIngestion}>Run LinkedIn Ingestion and Sentiment Analysis</button>
            </div>
        </div>
        <ContentBody settings={settings} alreadyScraped={alreadyScraped} setScraped={setScraped}/>
    </div>;
};

export default LinkedinContent;