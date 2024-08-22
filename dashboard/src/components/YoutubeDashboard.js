import React from 'react'
import Sidebar from './Sidebar'
import YoutubeContent from './YoutubeContent'
import '../styles/twitterDashboard.css';
// import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// import axios from 'axios';

const YoutubeDashboard = () => {

  return (
    <div className='dashboard'>
      {/* <p>{text}</p> */}
      <Sidebar />
      <div className='dashboard--content'>
        <YoutubeContent />
      </div>
      {/* <p>YOUTUBE</p> */}
    </div>
  )
}

export default YoutubeDashboard;