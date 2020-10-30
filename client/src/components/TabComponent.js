import React from 'react';
import AccountLink from './AccountLink.js'
import { NavLink } from 'react-router-dom'
import { screens } from '../const'

class TabComponent extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            currentScreen: 0
        }
    }

    render(){
        return(
            <div id="tab-component-container">
                <ul id='tab-component-nav-container' className='nav'>
                    <li className='nav-item tab-component-link-container'>
                        <NavLink href='#' className='nav-link tab-component-link title color-accented' activeClassName='nav-link tab-component-link-selected' to="/main/home">Home</NavLink>
                    </li>
                    <li className='nav-item tab-component-link-container'>
                        <NavLink href='#' className='nav-link tab-component-link title color-accented' activeClassName='nav-link tab-component-link-selected' to="/main/session">Session</NavLink>
                    </li>
                    <li className='nav-item tab-component-link-container'>
                        <NavLink href='#' className='nav-link tab-component-link title color-accented' activeClassName='nav-link tab-component-link-selected' to="/main/search">Search</NavLink>
                    </li>
                </ul>
                <AccountLink auth={this.props.auth} id={this.props.user.Id} image={this.props.user.image} handleLogOut={this.props.handleLogOut}/>
            </div>
        )
    }
}

export default TabComponent;