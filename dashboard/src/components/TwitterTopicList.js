import React, {useState, useEffect} from "react";
import '../styles/topicList.css'; 
import axios from "axios";
// import Image1 from '../assets/genesys.png'; 
// import topics from '../assets/topic_data.json';

const TopicList = ({settings}) => {
    const [topics, setTopics] = useState([]);

    useEffect(() => {
        axios.post(`${process.env.REACT_APP_API_BASE_URL}/twitter-topics`, {account: settings["twitterName"]})
      .then(res => {
        setTopics(res.data);
      })

    }, []);


    // useEffect(() => {
    //     // If you're using Create React App and the file is in the public folder
    //     fetch('json_files/topic_data.json')
    //       .then(response => {
    //         if (!response.ok) {
    //           throw new Error('Network response was not ok');
    //         }
    //         return response.json();
    //       })
    //       .then(topics => setTopics(topics))
    //       .catch(error => console.error('There has been a problem with your fetch operation:', error));
    //   }, []);

    return (
        <div className="topic--list">
            <div className="list--header">
                <h3>Top Topics</h3>
                <div className="list--columns">
                    <h5>Topic</h5>
                    <h5>Sentiment</h5>
                </div>
            </div>
            <div className="list--container">
                {topics.map((topic) => (
                    <div className="list">
                        <span>{topic.keyword}</span>
                        <span>{topic.sentiment}</span>
                    </div>
                ))}
            </div>
        </div>
    )
};

export default TopicList;