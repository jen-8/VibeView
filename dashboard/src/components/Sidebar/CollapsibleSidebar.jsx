import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import MuiAppBar from '@mui/material/AppBar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link } from "react-router-dom";
import routes from "../../routes";
import UserProfile from './UserProfile';
import "./CollapsibleSidebar.scss";
import {PiScanSmileyLight} from 'react-icons/pi';

const drawerWidth = 260;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  [theme.breakpoints.down('sm')]: {
    minHeight: '36px', 
  },
  [theme.breakpoints.up('sm')]: {
    minHeight: '36px', 
  },
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
  })(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundColor: '#ffffff',
    boxShadow: 'none',
    
  }));

const CustomToolbar = styled(Toolbar)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    minHeight: '48px', 
  },
  [theme.breakpoints.up('sm')]: {
    minHeight: '48px',
  },
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function CollapsibleSidebar(props) {
  const { views, setViews } = props;
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleDrawerStatus = () => {
    setOpen(!open);
  };

  const handleMenuClose = () => {
    setAnchorEl(null); 
  };

  return (
    <Box sx={{ display: 'flex' , backgroundColor: 'var(--background)'}}>
      <CssBaseline />
      <AppBar position="fixed">
        <CustomToolbar>
          <IconButton
            aria-label="open drawer"
            onClick={handleDrawerStatus}
            edge="start"
            sx={{
              marginRight: 3,
              color: 'var(--font)'
            }}
          >
            <MenuIcon />
          </IconButton>
          <PiScanSmileyLight className="icon" style={{ fill: "var(--font)", fontSize: theme.typography.h4.fontSize }} />
          <Typography variant="h6" noWrap component="div" sx={{ color: 'var(--font)', fontWeight: 'bold' }}>
            {process.env.REACT_APP_TITLE || "VibeView"}
          </Typography>
          {/* <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center'}}>
            <Stack direction="row" spacing={1} alignItems="center">
            <IconButton 
              aria-label="settings"
              aria-controls="simple-menu"
              aria-haspopup="true"
            >
              <MailIcon />
            </IconButton>
            <IconButton 
              aria-label="settings"
              aria-controls="simple-menu"
              aria-haspopup="true"
            >
              <NotificationsIcon />
            </IconButton>
            <IconButton 
              aria-label="settings"
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={handleAvatarClick}
            >
              <AccountCircle />
            </IconButton>
            </Stack>
          </div> */}
        </CustomToolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={open}
        // onClose={handleDrawerStatus}
        // onOpen={handleDrawerStatus}
        disableScrollLock={true}
        // sx={{
        //   '& .MuiDrawer-paper': {
        //     width: {
        //       xs: '50%',
        //       md: '50%'
        //     }
        //   }
        // }}
      >
        <DrawerHeader sx={{ padding: '24px'}} />
        <Divider />
        <List>
          {routes.map((route, index) => (
            <Link 
              key={index} 
              onClick={() => {setViews(route.path);}} 
              className='link-container'
              style={{ textDecoration: 'none' }}
              >
              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    backgroundColor: route.path === views ? 'var(--primary)' : 'inherit', // Highlight if current path
                    color: route.path === views ? '#ffffff' : 'var(--font)',
                    '&:hover': {
                      backgroundColor: 'var(--primary2)',
                      color: 'var(--font)'
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color: 'inherit',
                    }}
                  >
                    {route.icon}
                  </ListItemIcon>
                  <ListItemText primary={route.name} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </ListItem>
            </Link>
          ))}
        </List>
        {/* <Divider /> */}
      </Drawer>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        disableScrollLock={true}
      >
        <MenuItem sx={{ pointerEvents: 'none' }}>
          <UserProfile />
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Settings
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}
