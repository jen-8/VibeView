import React, {useState, useEffect} from 'react';
import '../styles/recommendations.css';
import axios from 'axios';

const Recommendations = ({settings}) => {
    const [recommendations, setRecommendations] = useState([]);

    // useEffect(() => {
    //     // If you're using Create React App and the file is in the public folder
    //     fetch('json_files/recommendations.json')
    //       .then(response => {
    //         if (!response.ok) {
    //           throw new Error('Network response was not ok');
    //         }
    //         return response.json();
    //       })
    //       .then(recommendations => setRecommendations(recommendations))
    //       .catch(error => console.error('There has been a problem with your fetch operation:', error));
    //   }, []);

    useEffect(() => {
      const fetchData = async () => {
        try {
          console.log("Making API request to:", `${process.env.REACT_APP_API_BASE_URL}/recommendations`);
          const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/recommendations`, {account: settings["youtubeName"], platform: "youtube"});
          setRecommendations(res.data);
          console.log("Received data:", recommendations);
        } catch (err) {
          console.error("Failed to fetch data:", err);
        }
      };
  
      fetchData();
    }, []);

    return <div className='recommendations--container'>
        {Array.isArray(recommendations) && recommendations.length > 0 && recommendations.map((item) => (
            <div className='card'>
                <h4 className='card--title'>{Object.keys(item)[0]}</h4>
                <div className='card--text'>
                    <p>{item[Object.keys(item)[0]]}</p> 
                </div>
            </div>
        ))}
    </div>
};

export default Recommendations;