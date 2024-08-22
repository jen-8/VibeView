import React from 'react';
import {PiScanSmileyLight} from 'react-icons/pi';
// import {BiHome} from 'react-icons/bi';
import {FaTwitter, FaYoutube, FaLinkedin, FaHome} from 'react-icons/fa';
import { IoMdSettings } from "react-icons/io";
import {NavLink} from 'react-router-dom';

import "../styles/sidebar.css";

const Sidebar = () => {

    return (
        <div className='menu'>
            <div className='logo'>
                <PiScanSmileyLight className="icon"/>
                <h2>VibeView</h2>
            </div>
            <div className='menu--list'>
                {/* a element is a hyperlink (href is the link) href = # means scroll to top of page */}
                <NavLink to='/home' className='item'>
                    <FaHome className='icon'/>
                    Overview
                </NavLink>
                <NavLink to='/twitter' className='item'>
                    <FaTwitter className='icon'/>
                    Twitter
                </NavLink>
                <NavLink to='/youtube' className='item'>
                    <FaYoutube className='icon'/>
                    YouTube
                </NavLink>
                <NavLink to='/linkedin' className='item'>
                    <FaLinkedin className='icon'/>
                    LinkedIn
                </NavLink>
                <NavLink to='/settings' className='item'>
                    <IoMdSettings className='icon'/>
                    Settings
                </NavLink>
            
            </div>
        </div>
    )
};

export default Sidebar;