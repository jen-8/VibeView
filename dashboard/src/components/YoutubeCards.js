import React, {useState, useEffect} from 'react';
// import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import axios from 'axios';
import { IconButton, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';


const Card = ({settings}) => {
    const [stats, setStats] = useState([]);
    // const location = useLocation();
    // const file = location.pathname === "/twitter" ? "json_files/twitter_stats.json" : location.pathname === "/youtube" ? "json_files/youtube_stats.json" : "json_files/linkedin_stats.json"

    useEffect(() => {
        axios.post(`${process.env.REACT_APP_API_BASE_URL}/youtube-stats`, {account: settings["youtubeName"]})
      .then(res => {
        setStats(res.data);
      })

    }, []);

    // useEffect(() => {
    //     // If you're using Create React App and the file is in the public folder

    //     fetch(file)
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error('Network response was not ok');
    //         }
    //         return response.json();
    //     })
    //     .then(stats => setStats(stats))
    //     .catch(error => console.error('There has been a problem with your fetch operation:', error));
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    //   }, []);

    return <div className='statscard--container'>
        {stats.map((item) => (
            <div className='card'>
                <div className='card--title'>
                    <h2>{item.title}</h2>
                    <Tooltip title="Shows cumulative stats to date">
                        <IconButton>
                            <InfoIcon/>
                        </IconButton>
                    </Tooltip>
                </div>
                <div className='card--text'>
                    <p>{item.text}</p> 
                </div>
            </div>
        ))}
    </div>
};

export default Card;