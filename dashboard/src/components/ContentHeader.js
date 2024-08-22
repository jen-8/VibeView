import React, {useState} from 'react';
import { useLocation } from 'react-router-dom';
// import {BiSearch, BiNotification} from 'react-icons/bi';

const ContentHeader = () => {
    const location = useLocation();
    // const [needButton, setneedButton] = useState(true);

    // if (location.pathname === "/home") {
    //     setneedButton(false);
    //     console.log(needButton);
    // };

    return (<div className='content--header'>
        <h1 className='header--title'>{location.pathname === "/twitter" ? "Twitter Dashboard" : location.pathname === "/youtube" ? "YouTube Dashboard" : location.pathname === "/linkedin" ? "LinkedIn Dashboard" : "Overview"}</h1>
        <div className='header--activity'>

            {location.pathname === "/home" ? null : <button className='start--button'>Run {location.pathname === "/twitter" ? "Twitter" : location.pathname === "/youtube" ? "YouTube" : "LinkedIn"} Sentiment Analysis</button>}
            
            {/* <div className='search-box'>
                <input type='text'placeholder='Search something here...'/>
                <BiSearch className='icon'/>
            </div> */}

            {/* <div className='notify'>
                <BiNotification className='icon'/>
            </div> */}
        </div>
    </div>
    );
};

export default ContentHeader;