import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import CollapsibleSidebar from './Sidebar/CollapsibleSidebar';
import Sidebar from './Sidebar';
import routes from '../routes';
import TwitterContent from './TwitterContent';
import YoutubeContent from './YoutubeContent';
import SettingContent from './SettingContent';
import OverviewContent from './OverviewContent';
import LinkedinContent from './LinkedinContent';

export default function Home(props) {
  const { ...rest } = props;
//   const location = useLocation();
  const drawerWidth = 260;
  const [open, setOpen] = React.useState(true);
  const [currentRoute, setCurrentRoute] = React.useState("Configuration");
  const [views, setViews] = useState("overview")
  const [a, setA] = useState("")
//   React.useEffect(() => {
//     window.addEventListener("resize", () =>
//       window.innerWidth < 1200 ? setOpen(false) : setOpen(true)
//     );
//   }, []);
//   React.useEffect(() => {
//     getActiveRoute(routes);
//     console.log(location);
//     console.log(getActiveRoute(routes));
//   }, [location.pathname]);

//   const getActiveRoute = (routes) => {
//     let activeRoute = "Main Dashboard";
//     for (let i = 0; i < routes.length; i++) {
//       if (
//         window.location.href.indexOf(
//           routes[i].layout + "/" + routes[i].path
//         ) !== -1
//       ) {
//         setCurrentRoute(routes[i].name);
//       }
//     }
//     return activeRoute;
//   };
  const [youtubeChannel, setYoutubeChannel] = useState({
    youtubeChannel: ""
  })

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [settings, setSettings] = useState({
    twitterName: 'Marvel',
    youtubeName: 'UC0m-80FnNY2Qb7obvTL_2fA',
    linkedinName: 'amazon',
    twitterPosts: '1',
    youtubePosts: '1',
    linkedinPosts: '1',
    timezone: timezone
  });

  return (
    <Box sx={{ display: 'flex' }}>
        <CollapsibleSidebar drawerWidth={drawerWidth} 
                            onClose={() => setOpen(false)}
                            views={views}
                            setViews={setViews}/>
        <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth + 48}px)` }, padding: '0px', paddingTop: '48px' }}>
            {views === 'overview' && 
                <OverviewContent settings={settings} setViews={setViews} setYoutubeChannel={setYoutubeChannel}/>
            } 
            {views === 'twitter' && 
                <TwitterContent settings={settings}/>
            }
            {views === 'youtube' && 
                <YoutubeContent settings={settings} youtubeChannel={youtubeChannel}/>
            }
            {views === 'linkedin' &&
                <LinkedinContent settings={settings}/>
            }
            {views === 'settings' &&
                <SettingContent settings={settings} setSettings={setSettings} />    
            }
        </Box>
    </Box>   
  );
}
