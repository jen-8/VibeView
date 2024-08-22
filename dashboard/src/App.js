import React from 'react'
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TwitterDashboard from './components/TwitterDashboard';
import YoutubeDashboard from './components/YoutubeDashboard';
import HomePage from './components/Home';
import Overview from './components/Overview';
import Settings from './components/Settings';

// import axios from 'axios';

const App = () => {


  return (
    <Router>
      <Routes>
        {/* <Redirect exact from="/" to="/twitter"/> */}
        <Route path="/*" element={<HomePage />} />
          {/* <Route path="/twitter">
            <TwitterDashboard/>
          </Route>
          <Route path="/youtube">
            <YoutubeDashboard />
          </Route> */}
      </Routes>
    </Router>
  )
}

export default App;