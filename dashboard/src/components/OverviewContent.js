import React, { useEffect, useState } from "react";
import "../styles/home.css";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import {FaYoutube, FaLinkedin, FaCommentDots } from "react-icons/fa";
import {FaXTwitter} from "react-icons/fa6";
import { Grid, IconButton, Tooltip, Typography } from "@mui/material";
import YouTube from "react-youtube";
import {LinkedInEmbed, XEmbed} from 'react-social-media-embed';
import axios from "axios";
import { AiFillLike } from "react-icons/ai";
import { MdSentimentSatisfiedAlt, MdSentimentNeutral, MdSentimentVeryDissatisfied } from "react-icons/md";

import OverviewBarChart from "./Chart/OverviewBarChart";
import InfoIcon from "@mui/icons-material/Info";

const OverviewContent = (props) => {
  const [data, setData] = useState([]);

  const {
    setViews,
    settings,
    setYoutubeChannel
  } = props

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Making API request to:", `${process.env.REACT_APP_API_BASE_URL}/general-stats`);
        const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/general-stats`, 
          {
            twitterAccount: settings["twitterName"], 
            youtubeAccount: settings["youtubeName"], 
            linkedinAccount: settings["linkedinName"]
          });
        setData(res.data);
        setYoutubeChannel(res.data[1]["accountName"]);
        // setYoutubeChannel(res.data[1] !== undefined ? ('accountName' in res.data[1] ? res.data[1]["accountName"] : "dffdfsd") : "data undefined");
        console.log("Received data:", res.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, [settings]);

  // console.log(data[1] === undefined ? null : data[1]);
  // console.log(data.twitter_recent)
  // console.log("total likes");
  // console.log(data[0] !== undefined ? data[0]["Total Likes"] : "not found");

  const options = {
    height: '295',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
    },
  };

  // pauses youtube video once it loads so it doesnt automatically play
  const handlePause = (e) => {
    // e.target.pauseVideo();
  };

  // console.log(data[0] === undefined ? "empty data[0]" : 'mostRecent' in data[0]);
  // console.log()


  return (
    <div className="content">
      <div className='content--header'>
          <h1 className='header--title'>Overview</h1>
      </div>
      <div className="card--container">
        <div className="card">
          <h3>Most Recent Posts</h3>
          <div className="posts">
            <div className="post-container">
              <p>X (Twitter)</p>
              {/* <TwitterTweetEmbed tweetId='1794517537251856524'/> */}
              {data[0] !== undefined ? 'mostRecent' in data[0] ? <XEmbed url={data[0]["mostRecent"]} width={"100%"} height={300} /> : <p/> : <p/>}
              {/* <XEmbed url="https://twitter.com/DisneyAnimation/status/1816142026922156399" width={"100%"} height={300}/> */}
              {/* <p>Date posted: </p> */}
              {data[0] !== undefined ? 
                <div className="posts-stats">
                  <p>Posted: {data[0]["mostRecentDate"]}</p>
                  <div className="posts-stats-row">
                    <AiFillLike className="posts-stats-icon"/>
                    {data[0]["mostRecentNumLikes"]}
                    <div className="posts-stats-divider"/>
                    <FaCommentDots className="posts-stats-icon"/>
                    {data[0]["mostRecentNumComments"]}
                    <div className="posts-stats-divider"/>
                    {data[0]["mostRecentSentiment"] >= 0.25 ? <MdSentimentSatisfiedAlt className="posts-stats-icon"/> : data[0]["mostRecentSentiment"] <= -0.25 ? <MdSentimentVeryDissatisfied className="posts-stats-icon"/> : <MdSentimentNeutral className="posts-stats-icon"/>}
                    {data[0]["mostRecentSentiment"]}
                  </div>
                </div>
                : <p></p>
              }
              
            </div>

            <div className="post-container">
              <p>YouTube</p>
              {data[0] !== undefined ? 'mostRecent' in data[1] ? <YouTube videoId={data[1]["mostRecent"]} opts={options} onReady={handlePause} id="video"/> : <p/> : <p/>}
              {data[1] !== undefined ? 
                <div className="posts-stats">
                  <p>Posted: {data[1]["mostRecentDate"]}</p>
                  <div className="posts-stats-row">
                    <AiFillLike className="posts-stats-icon"/>
                    {data[1]["mostRecentNumLikes"]}
                    <div className="posts-stats-divider"/>
                    <FaCommentDots className="posts-stats-icon"/>
                    {data[1]["mostRecentNumComments"]}
                    <div className="posts-stats-divider"/>
                    {data[1]["mostRecentSentiment"] >= 0.25 ? <MdSentimentSatisfiedAlt className="posts-stats-icon"/> : data[1]["mostRecentSentiment"] <= -0.25 ? <MdSentimentVeryDissatisfied className="posts-stats-icon"/> : <MdSentimentNeutral className="posts-stats-icon"/>}
                    {data[1]["mostRecentSentiment"]}
                  </div>
                </div>
                : <p></p>
              }
            </div> 

            <div className="post-container">
              <p>LinkedIn</p>
              {data[2] !== undefined ? 'mostRecent' in data[2] && 'mostRecentText' in data[2] ? 
                <a className="linkedin--recent--link" href={data[2]["mostRecent"]} rel="noreferrer" target="_blank" >
                  <div className="linkedin--recent--container">
                    <p><b>{data[2]["accountName"]}</b></p>
                    <p>{data[2]["mostRecentText"]}</p>
                  </div>  
                </a>
                 : <p/> : <p/> }
              {/* {data[2] !== undefined ? 'mostRecent' in data[2] ? <LinkedInEmbed postUrl={data[2]["mostRecent"]} width={"100%"} height={300}/> : <p/> : <p/>} */}
              {/* {data[2] !== undefined ? 'mostRecent' in data[2] ? <LinkedInEmbed url="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7229494670261719042" width={"100%"} height={300}/> : <p/> : <p/>} */}

              {data[2] !== undefined ? 
                <div className="posts-stats">
                  <p>Posted: {data[2]["mostRecentDate"]}</p>
                  <div className="posts-stats-row">
                    <AiFillLike className="posts-stats-icon"/>
                    {data[2]["mostRecentNumLikes"]}
                    <div className="posts-stats-divider"/>
                    <FaCommentDots className="posts-stats-icon"/>
                    {data[2]["mostRecentNumComments"]}
                    <div className="posts-stats-divider"/>
                    {data[2]["mostRecentSentiment"] >= 0.25 ? <MdSentimentSatisfiedAlt className="posts-stats-icon"/> : data[2]["mostRecentSentiment"] <= -0.25 ? <MdSentimentVeryDissatisfied className="posts-stats-icon"/> : <MdSentimentNeutral className="posts-stats-icon"/>}
                    {data[2]["mostRecentSentiment"]}
                  </div>
                </div>
                : <p></p>
              }
            </div>
            
          </div>

        </div>
        <div className="card">
          <h3>Sources</h3>
          <div className="sources--list">
            <div className="source--container">
            <Card
              sx={{
                display: "flex",
                backgroundColor: "white",
                borderRadius: "10px",
                width: "350px",
                border: "none",
                flexDirection: "row",
                
              }}
            >
              <CardContent onClick={() => setViews("twitter")} sx={{width: "100%", position: "relative", p: 0, ":hover": {cursor: "pointer"}}}>
                {/* <NavLink to="/twitter" className="source"> */}
                  <Grid
                    container
                    spacing={2}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      // height: "140%",
                      // width: "140%",
                      paddingLeft: "20px",
                      paddingTop: "20px"
                    }}
                  >
                    <Grid
                      item
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                        alignItems: "center",
                        padding: "16px"
                      }}
                    >
                      <Typography variant="h6" fontFamily={"Montserrat"}>
                        X (Twitter)
                      </Typography>
                      {/* <FaTwitter className="overview-icon" color="#1DA1F2" /> */}
                      <FaXTwitter className="overview-icon" color="#000000"/>
                    </Grid>
                    <Grid
                      item
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <Typography variant="p">{data[0] !== undefined ? 'numPositive' in data[0] ? <p>{data[0]["numPositive"]} Positive Posts</p> : <p/> : <p/>}</Typography>
                      <Typography variant="p">{data[0] !== undefined ? 'numNeutral' in data[0] ? <p>{data[0]["numNeutral"]} Neutral Posts</p> : <p/> : <p/>}</Typography>
                      <Typography variant="p">{data[0] !== undefined ? 'numNegative' in data[0] ? <p>{data[0]["numNegative"]} Negative Posts</p> : <p/> : <p/>}</Typography>                      
                      {/* <Typography variant="p">{data[0] !== undefined ? data[0]["General Sentiment"] : "Unknown"} Sentiment</Typography> */}
                      <Typography variant="p">{data[0] !== undefined ? ('Total Likes' in data[0] && 'numPosts' in data[0]) ? +(data[0]["Total Likes"]/data[0]["numPosts"]).toFixed(2) : 0 : <p/>} Likes/Post</Typography>
                      <Typography variant="p">{data[0] !== undefined ? ('Total Retweets' in data[0] && 'numPosts' in data[0]) ? +(data[0]["Total Retweets"]/data[0]["numPosts"]).toFixed(2) : 0 : <p/>} Retweets/Post</Typography>
                    </Grid>
                  </Grid>
                {/* </NavLink> */}
              </CardContent>
            </Card>
            <p>{data[0] !== undefined ? 'accountName' in data[0] ? <b>{data[0]["accountName"]}</b> : "Unknown Username" : <p/>}</p>
            <p>{data[0] !== undefined ? 'numPosts' in data[0] ?  <p>{data[0]["numPosts"]} Posts Ingested</p> : <p/> : <p/>}</p>
            {/* <p>{data[0] !== undefined ? data[0]["accountName"] : "Unknown Username"}</p> */}
          </div>

          <div className="source--container">
            <Card
              sx={{
                display: "flex",
                backgroundColor: "white",
                borderRadius: "10px",
                width: "350px",
                border: "none",
                flexDirection: "row",
                
              }}
            >
              <CardContent onClick={() => setViews("youtube")} sx={{width: "100%", position: "relative", p: 0, ":hover": {cursor: "pointer"}}}>
                {/* <NavLink to="/youtube" className="source"> */}
                  <Grid
                    container
                    spacing={2}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: "20px",
                      paddingTop: "20px"
                    }}
                  >
                    <Grid
                      item
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                        alignItems: "center",
                        padding: "16px"
                      }}
                    >
                      <Typography variant="h6" fontFamily={"Montserrat"}>
                        YouTube
                      </Typography>
                      <FaYoutube className="overview-icon" color="#FF0000" />
                    </Grid>
                    <Grid
                      item
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <Typography variant="p">{data[1] !== undefined ? 'numPositive' in data[1] ? <p>{data[1]["numPositive"]} Positive Videos</p> : <p/> : <p/>}</Typography>
                      <Typography variant="p">{data[1] !== undefined ? 'numNeutral' in data[1] ? <p>{data[1]["numNeutral"]} Neutral Videos</p> : <p/> : <p/>}</Typography>
                      <Typography variant="p">{data[1] !== undefined ? 'numNegative' in data[1] ? <p>{data[1]["numNegative"]} Negative Videos</p> : <p/> : <p/>}</Typography>    
                      {/* <Typography variant="p">{data[1] !== undefined ? data[1]["General Sentiment"] : "Unknown"} Sentiment</Typography> */}
                      <Typography variant="p">{data[1] !== undefined ? ('Total Likes' in data[1] && 'numPosts' in data[1]) ? +(data[1]["Total Likes"]/data[1]["numPosts"]).toFixed(2) : 0 : <p/>} Likes/Video</Typography>
                      <Typography variant="p">{data[1] !== undefined ? ('Total Comments' in data[1] && 'numPosts' in data[1]) ? +(data[1]["Total Comments"]/data[1]["numPosts"]).toFixed(2) : 0 : <p/>} Comments/Video</Typography>
                    </Grid>
                  </Grid>
                {/* </NavLink> */}
              </CardContent>
            </Card>
            <p>{data[1] !== undefined ? 'accountName' in data[1] ? <b>{data[1]["accountName"]}</b> : "Unknown Channel ID" : <p/>}</p>
            <p>{data[1] !== undefined ? 'numPosts' in data[1] ?  <p>{data[1]["numPosts"]} Videos Ingested</p> : <p/> : <p/>}</p>
          </div>

          <div className="source--container">
            <Card
              sx={{
                display: "flex",
                backgroundColor: "white",
                borderRadius: "10px",
                width: "350px",
                border: "none",
                flexDirection: "row",
                
              }}
            >
              <CardContent onClick={() => setViews("linkedin")} sx={{width: "100%", position: "relative", p: 0, ":hover": {cursor: "pointer"}}}>
                {/* <NavLink to="/linkedin" className="source"> */}
                  <Grid
                    container
                    spacing={2}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: "20px",
                      paddingTop: "20px"
                    }}
                  >
                    <Grid
                      item
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                        alignItems: "center",
                        padding: "16px"
                      }}
                    >
                      <Typography variant="h6" fontFamily={"Montserrat"}>
                        LinkedIn
                      </Typography>
                      <FaLinkedin className="overview-icon" color="#0077B5" />
                    </Grid>
                    <Grid
                      item
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <Typography variant="p">{data[2] !== undefined ? 'numPositive' in data[2] ? <p>{data[2]["numPositive"]} Positive Posts</p> : <p/> : <p/>}</Typography>
                      <Typography variant="p">{data[2] !== undefined ? 'numNeutral' in data[2] ? <p>{data[2]["numNeutral"]} Neutral Posts</p> : <p/> : <p/>}</Typography>
                      <Typography variant="p">{data[2] !== undefined ? 'numNegative' in data[2] ? <p>{data[2]["numNegative"]} Negative Posts</p> : <p/> : <p/>}</Typography>    
                      {/* <Typography variant="p">{data[2] !== undefined ? data[2]["General Sentiment"] : "Unknown"} Sentiment</Typography> */}
                      <Typography variant="p">{data[2] !== undefined ? ('Total Likes' in data[2] && 'numPosts' in data[2]) ? +(data[2]["Total Likes"]/data[2]["numPosts"]).toFixed(2) : 0 : <p/>} Likes/Post</Typography>
                      <Typography variant="p">{data[2] !== undefined ? ('Total Shares' in data[2] && 'numPosts' in data[2]) ? +(data[2]["Total Shares"]/data[2]["numPosts"]).toFixed(2) : 0 : <p/>} Shares/Post</Typography>
                    </Grid>
                  </Grid>
                {/* </NavLink> */}
              </CardContent>
            </Card>
            <p>{data[2] !== undefined ? 'accountName' in data[2] ? <b>{data[2]["accountName"]}</b> : "Unknown Username" : <p/>}</p>
            <p>{data[2] !== undefined ? 'numPosts' in data[2] ?  <p>{data[2]["numPosts"]} Posts Ingested</p> : <p/> : <p/>}</p>
          </div>
        </div>
        </div>
        <div className="card">
          <div className="chart--title">
            <h2>Average Comments Sentiment</h2>
            <Tooltip title={<div>
                              Dates Ingested<br/>
                              X: {data[0] !== undefined ? 'recentIngestedDate' in data[0] ? data[0]["recentIngestedDate"] : <p/> : <p/>}<br/> 
                              YouTube: {data[1] !== undefined ? 'recentIngestedDate' in data[1] ? data[1]["recentIngestedDate"] : <p/> : <p/>}<br/> 
                              LinkedIn: {data[2] !== undefined ? 'recentIngestedDate' in data[2] ? data[2]["recentIngestedDate"] : <p/> : <p/>}
                              </div>}>
              <IconButton>
                  <InfoIcon/>
              </IconButton>
            </Tooltip>
          </div>
          <OverviewBarChart data={data} />
        </div>
        
      </div>
    </div>
  );
};

export default OverviewContent;
