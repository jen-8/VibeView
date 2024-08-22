// import TwitterDashboard from "./components/TwitterDashboard";
// import YoutubeDashboard from "./components/YoutubeDashboard";

// Icon Imports
import DashboardIcon from '@mui/icons-material/Dashboard';
// import TwitterIcon from '@mui/icons-material/Twitter';
import XIcon from '@mui/icons-material/X';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import SettingsIcon from '@mui/icons-material/Settings';

const routes = [
  {
    name: "Overview",
    layout: "/",
    path: "overview",
    icon: <DashboardIcon/>,
    // component: <TwitterDashboard />,
  },
  {
    name: "X (Twitter)",
    layout: "/",
    path: "twitter",
    icon: <XIcon/>
    // component: <TwitterDashboard />,
  },
  {
    name: "YouTube",
    layout: "/",
    path: "youtube",
    icon: <YouTubeIcon/>,
    // component: <YoutubeDashboard />,
  },
  {
    name: "LinkedIn",
    layout: "/",
    path: "linkedin",
    icon: <LinkedInIcon/>,
  },
  {
    name: "Settings",
    layout: "/",
    path: "settings",
    icon: <SettingsIcon/>,
    // component: <YoutubeDashboard />,
  }
];
export default routes;
