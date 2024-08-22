import React from 'react';
import Sidebar from './Sidebar';
import TwitterContent from './TwitterContent';
import '../styles/twitterDashboard.css';
// import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// import axios from 'axios';

const TwitterDashboard = () => {
  // const [text, setText] = useState("");

  // axios.get('http://example.com/')
  //     .then(res => {
  //       console.log(res);
  //       console.log(res.data);
  //     })


  return (
    <div className='dashboard'>
      {/* <p>{text}</p> */}
      <Sidebar />
      <div className='dashboard--content'>
        <TwitterContent />
      </div>
    </div>
  )
}

export default TwitterDashboard;