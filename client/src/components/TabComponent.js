import React from 'react';
import AccountLink from './AccountLink.js'
import { NavLink } from 'react-router-dom'
import { mainScreens } from '../const'

class TabComponent extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        return(
            <div id="tab-component-container">
                <ul id='tab-component-nav-container' className='nav'>
                    <li className='nav-item tab-component-link-container'>
                        <NavLink href='#' className='nav-link tab-component-link title color-accented' activeClassName='nav-link tab-component-link-selected' onClick={() => this.props.switchScreen(mainScreens.HOME)} to={'/main'}>Home</NavLink>
                    </li>
                    <li className='nav-item tab-component-link-container'>
                        <NavLink href='#' className='nav-link tab-component-link title color-accented' activeClassName='nav-link tab-component-link-selected' onClick={() => this.props.switchScreen(mainScreens.SESSION)} to={'/main'}>Session</NavLink>
                    </li>
                    <li className='nav-item tab-component-link-container'>
                        <NavLink href='#' className='nav-link tab-component-link title color-accented' activeClassName='nav-link tab-component-link-selected' onClick={() => this.props.switchScreen(mainScreens.SEARCH)} to={'/main'}>Search</NavLink>
                    </li>
                </ul>
                <AccountLink switchScreen={this.props.switchScreen} auth={this.props.auth} user={this.props.user} axiosWrapper={this.props.axiosWrapper} handleLogOut={this.props.handleLogOut} history={this.props.history}/>
            </div>
        )
    }
}

export default TabComponent;