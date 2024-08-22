import React from 'react';
import { Avatar, Button, Grid, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';

const getInitials = (name) => {
    return name.split(' ').map((n) => n[0]).join('');
  };

function UserProfile() {
  return (
    <Grid container spacing={2} alignItems="center" sx={{ maxWidth: 250, minWidth: 220}}>
      <Grid item xs={4}>
        <Avatar
          alt="User Avatar"
          sx={{ cursor: 'pointer', bgcolor: blue[500], width: 56, height: 56, pointerEvents: 'auto' }}
        >
            {getInitials(process.env.REACT_APP_TITLE || "Dialog")}
        </Avatar>

      </Grid>
      <Grid item xs={8}>
        <Typography variant="body1">{(process.env.REACT_APP_TITLE || "Dialog")}</Typography>
      </Grid>
    </Grid>
  );
}

export default UserProfile;
