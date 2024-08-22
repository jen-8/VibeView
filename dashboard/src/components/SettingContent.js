import React from 'react';
import { TextField, Grid, Typography } from '@mui/material';
import '../styles/postsList.css';

const SettingContent = ({settings, setSettings}) => {

  const handleChange = (prop) => (event) => {
    setSettings({ ...settings, [prop]: event.target.value });
  };

  const handleSubmit = () => {
    console.log('Settings: ', settings);
  };

  return (
    <div className='content'>
      <div className='content--header'>
        <h1 className='header--title'>Settings</h1>
      </div>
      <Grid container spacing={4}>
        {['twitter', 'youTube', 'linkedIn'].map((platform) => (
          <Grid item xs={12} sm={6} md={4}>
            <div className="setting">
              <Typography variant="h6" gutterBottom sx={{fontWeight: 'bold'}}>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </Typography>
              <TextField
                fullWidth
                margin="normal"
                label="Account Name"
                value={settings[`${platform.toLowerCase()}Name`]}
                onChange={handleChange(`${platform.toLowerCase()}Name`)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Number of Posts"
                type="number"
                value={settings[`${platform.toLowerCase()}Posts`]}
                onChange={handleChange(`${platform.toLowerCase()}Posts`)}
              />
            </div>
          </Grid>
        ))}
        <Grid item xs={12}>
          <button className='setting--button' variant="contained" color="primary" fullWidth onClick={handleSubmit}>
            Save Settings
          </button>
        </Grid>
      </Grid>
    </div>
  );
};

export default SettingContent;
