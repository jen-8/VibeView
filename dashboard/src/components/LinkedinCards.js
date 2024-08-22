import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { IconButton, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const LinkedinCards = ({settings}) => {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        axios.post(`${process.env.REACT_APP_API_BASE_URL}/linkedin-stats`, {account: settings["linkedinName"]})
      .then(res => {
        setStats(res.data);
      })

    }, []);


    return <div className='statscard--container'>
        {stats.map((item) => (
            <div className='card'>
                <div className='card--title'>
                    <h2>{item.title}</h2>
                    <Tooltip title='Shows cumulative stats to date'>
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

export default LinkedinCards;