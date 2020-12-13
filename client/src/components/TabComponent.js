import React from 'react';
import { ReactComponent as Yinyang } from '../graphics/yin-yang-fill-color-harmony.svg'
import AccountLink from './AccountLink.js'
import { mainScreens } from '../const'

class TabComponent extends React.Component{
    constructor(props){
        super(props)
    }

    handleSwitchScreen = (newScreen) => {
        this.setState({
            lastScreen: newScreen
        })
        this.props.switchScreen(newScreen)
    }

    getTabComponentClass = (screen) => {
        return screen === this.props.currentScreen ? 'tab-component-link-selected ' : 'tab-component-link '
    }

    render(){
        return(
            <div id="tab-component-container">
                <ul id='tab-component-nav-container' className='nav'>
                    <li className='nav-item tab-component-link-container'>
                        <div className={this.getTabComponentClass(mainScreens.HOME) + 'title color-accented'} onClick={() => this.handleSwitchScreen(mainScreens.HOME)}>Home</div>
                    </li>
                    <li className='nav-item tab-component-link-container'>
                        <div className={this.getTabComponentClass(mainScreens.SESSION) + 'title color-accented'} onClick={() => this.handleSwitchScreen(mainScreens.SESSION)}>Session</div>
                    </li>
                    <li className='nav-item tab-component-link-container'>
                        <div className={this.getTabComponentClass(mainScreens.SEARCH) + 'title color-accented'} onClick={() => this.handleSwitchScreen(mainScreens.SEARCH)}>Search</div>
                    </li>
                </ul>
                <Yinyang className="app-main-logo" onClick={() => this.handleSwitchScreen(mainScreens.HOME)}></Yinyang>
                <AccountLink switchScreen={this.props.switchScreen} auth={this.props.auth} user={this.props.user} axiosWrapper={this.props.axiosWrapper} handleLogOut={this.props.handleLogOut} history={this.props.history}/>
            </div>
        )
    }
}

export default TabComponent;