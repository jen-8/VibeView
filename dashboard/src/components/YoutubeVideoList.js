import React, {useState, useEffect} from "react";
import '../styles/postsList.css';
// import Image1 from '../assets/genesys.png';
import axios from 'axios';
// import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell , {tableCellClasses} from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import FilterListIcon from '@mui/icons-material/FilterList';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import { TableFooter } from "@mui/material";
import Button from '@mui/material/Button';
import { Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import DownloadIcon from '@mui/icons-material/Download';
 
const columns = [
    { id: 'link', label: 'Link', minWidth: 50
        // format: (value) => <a href={value}>Link</a>
    },
    {
      id: 'datePosted',
      label: 'Date',
      minWidth: 50
    },
    {
      id: 'topics',
      label: 'Topics',
      minWidth: 170,
      align: 'left',
      format: (value) =>
        {
        return (<div className="tags">
            {value.map((tag) => tag === "none" || tag === "" ? <></> : <span className="post--tag">{tag}</span>)}
            </div>); } ,
    },
    {
      id: 'numComments',
      label: 'Comments',
      midWidth: 50,
      align: 'left'
    },
    {
      id: 'sentiment',
      label: 'Sentiment From Comments',
      minWidth: 90,
      align: 'right',
      maxWidth: 100,
      format: (value) => {
        return Math.round(Number(value) * 10) / 10;
      }
    },
  ];
 
function Row(rowData) {
    const [open, setOpen] = React.useState(false);
    const row = rowData.rowData;
 
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
 
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
 
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
 
    return (
        <React.Fragment>
        <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
            {columns.map((column) => {
            const value = row[column.id];
            return (
                <TableCell key={column.id} align={column.align} sx = {{"font-family": "Montserrat, sans-serif"}}>
                {column.id === "link" ? <a href={value}>{row.title === undefined ? "Link" : row.title}</a> : column.format ? column.format(value) : value}
                </TableCell>
            );
            })}
            <TableCell>
            <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => setOpen(!open)}
            >
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
            </TableCell>
        </TableRow>
        <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div" sx = {{"font-family": "Montserrat, sans-serif"}}>
                Comments
              </Typography>
              <Table size="small" aria-label="">
                <TableHead>
                  <TableRow>
                    {/* <TableCell sx = {{"font-family": "Montserrat, sans-serif"}}>Link</TableCell> */}
                    <TableCell sx = {{"font-family": "Montserrat, sans-serif"}}>Text</TableCell>
                    <TableCell sx = {{"font-family": "Montserrat, sans-serif"}} align="right">Sentiment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                    {
                    row.comments
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map( (comment) => (
                        <TableRow>
                            {/* <TableCell sx = {{"font-family": "Montserrat, sans-serif"}}><a href={comment.link}>Link</a></TableCell> */}
                            <TableCell sx = {{"font-family": "Montserrat, sans-serif"}}>{comment.comment}</TableCell>
                            <TableCell sx = {{"font-family": "Montserrat, sans-serif"}}>{Math.round(Number(comment.sentiment) * 10) / 10}</TableCell>
                        </TableRow>
                    ))
                    }
                </TableBody>
              </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 100]}
                    component="div"
                    count={row.comments.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx = {{"font-family": "Montserrat, sans-serif"}}
                />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      </React.Fragment>
        );
};
 
const PostsList = ({settings}) => {
    const [posts, setPosts] = useState([]);
    const [allPosts, setAllPosts] = useState([]);
    const [topicFilter, setTopicFilter] = useState("");
    const [titleFilter, setTitleFilter] = useState("");
    // const [emotionFilter, setEmotionFilter] = useState("");
    const [dateFilter1, setDateFilter1] = useState(0);
    const [dateFilter2, setDateFilter2] = useState(Date.now());
    const [sentimentFilter1, setSentimentFilter1] = useState(-1);
    const [sentimentFilter2, setSentimentFilter2] = useState(1);

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
 
    useEffect(() => {
        axios.post(`${process.env.REACT_APP_API_BASE_URL}/youtube-videos`, {account: settings["youtubeName"]})
      .then(res => {
        setPosts(res.data);
        setAllPosts(res.data);
      })
 
    }, [settings]);

    const download = () => {
      const blob = new Blob([JSON.stringify(posts)], { type: "application/json" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        // feature detection
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "post_data.json");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }

    const filterPosts = () => {
      setPosts( allPosts.filter( 
        (value, index, array) => {
          let tags = value.topics;
          let date = null;
          try {
            date = Date.parse( value.datePosted );
          } catch {

          }
          let sentiment = Number(value.sentiment);
          let topicMatch = tags[0].includes(topicFilter) || tags[1].includes(topicFilter);
          let titleMatch = value.title.includes(titleFilter);
        //   let emotionMatch = value.emotion.includes(emotionFilter);
          let dateMatch = dateFilter1 <= date && date <= dateFilter2;
	  let sentimentMatch = sentimentFilter1 <= sentiment && sentiment <= sentimentFilter2;
          return titleMatch && dateMatch && topicMatch && sentimentMatch;} ) )
    }
 
    return (
        <div className="posts--list">
            <div className="list--header">
                 <h3>Videos</h3>
                 <div>
                 <Tooltip title="Topics are generated from posts by ChatGPT">
                    <IconButton>
                        <InfoIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download Raw Data">
                    <IconButton onClick={download}>
                        <DownloadIcon/>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Filter list">
                      <IconButton onClick={handleClick}>
                        <FilterListIcon />
                      </IconButton>
                    </Tooltip>
                    <Popover
                      id={id}
                      open={open}
                      anchorEl={anchorEl}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                    >
                      <Table>
                        <TableRow>
                          <TableCell>
                            Title:
                          </TableCell>
                          <TableCell>
                            <TextField size="small" onChange={(e) => setTitleFilter(e.target.value)}/>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            Topics:
                          </TableCell>
                          <TableCell>
                            <TextField size="small" onChange={(e) => setTopicFilter(e.target.value)}/>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            Date Range:
                          </TableCell>
                          <TableCell>
                            <TextField sx={{maxWidth:"100px", marginRight:"20px"}} size="small" 
                              onChange={(e) => setDateFilter1( Date.parse( e.target.value ) )}/>
                            <TextField sx={{maxWidth:"100px"}} size="small" 
                              onChange={(e) => setDateFilter2( Date.parse( e.target.value ) )}/>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            Sentiment Range:
                          </TableCell>
                          <TableCell>
                            <TextField sx={{maxWidth:"100px", marginRight:"20px"}} size="small" 
                              onChange={(e) => setSentimentFilter1( Number(e.target.value) )}/>
                            <TextField sx={{maxWidth:"100px"}} size="small" 
                              onChange={(e) => setSentimentFilter2( Number(e.target.value) )}/>
                          </TableCell>
                        </TableRow>
                        <TableFooter>
                          <Button onClick={ filterPosts }>Filter Posts</Button>
                          <Button align="right" onClick={ () => { 
                            setTopicFilter(""); 
                            setTitleFilter(""); 
                            setDateFilter1(0); 
                            setDateFilter2(Date.now());
                            setSentimentFilter1(-1);
                            setSentimentFilter2(1); 
                            filterPosts();
                            } }>
                            Clear Filter</Button>
                        </TableFooter>
                      </Table>
                    </Popover>
                  </div>
             </div>
            <TableContainer >
            <Table stickyHeader aria-label="sticky table, collapsible table" sx={{
                  [`& .${tableCellClasses.root}`]: {
                    borderBottom: "none"
                  }
                }}>
                <TableHead sx={{
                  [`& .${tableCellClasses.root}`]: {
                    borderBottom: "1px solid var(--primary)"
                  }
                }}>
                    <TableRow>
                    {columns.map((column) => (
                        <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth, maxWidth: column.maxWidth }}
                        sx = {{"font-family": "Montserrat, sans-serif", "font-weight": "700", "background-color": "rgb(221, 230, 237)"}}
                        >
                        {column.label}
                        </TableCell>
                    ))}
                    <TableCell sx = {{"font-family": "Montserrat, sans-serif", "font-weight": "700", "background-color": "rgb(221, 230, 237)"}}>
                    
                    </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {posts
                    .map((row) => { return (<Row rowData={row}></Row>); })}
                </TableBody>
                </Table>
            </TableContainer>
            </div>
        // <div className="posts--list">
        //     <div className="list--header">
        //         <h3>Top Posts</h3>
        //         {/* <div className="list--columns">
        //             <h5>Post</h5>
        //             <h5>Tags</h5>
        //             <h5>Sentiment</h5>
        //         </div> */}
        //     </div>
        //     {/* <div className="list--container">
        //         {posts.map((post) => (
        //             <div className="list">
        //                 <a href={post.link}>Link</a>
        //                 <div className="tags">
        //                     {post.tags.map((tag) => <span className="post--tag">{tag}</span>)}
        //                 </div>
        //                 <span>{post.sentiment}</span>
        //             </div>
        //         ))}
        //     </div> */}
        //      <table className="table">
        //         <tr>
        //             <th className="table--header">Post</th>
        //             <th className="table--header">Topics</th>
        //             <th className="table--header">Comments Sentiment</th>
        //             <th className="table--header">Post Emotion</th>
        //         </tr>
        //         {posts.map((post) => {
        //             return (
        //                 <tr>
        //                     <td className="text">
        //                         <a href={post.link}>Link</a>
        //                     </td>
        //                     <td className="text">
        //                         <div className="tags">
        //                         {post.tags.map((tag) => <span className="post--tag">{tag}</span>)}
        //                         </div>
        //                     </td>
        //                     <td className="text">{post.sentiment}</td>
        //                     <td className="text">{post.emotion}</td>
        //                 </tr>
        //             )
        //         })}
        //     </table>
        // </div> */
    );
};
 
export default PostsList;
