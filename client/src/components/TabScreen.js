import React from 'react';

class TabScreen extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            currentScreen: 0
        }
    }

    onPressHomeTab = () =>{
        this.setState({currentScreen: 0});
    }

    onPressSessionTab = () =>{
        this.setState({currentScreen: 1});
    }

    onPressSearchTab = () =>{
        this.setState({currentScreen: 2});
    }

    render(){
        return(
            <div>
                <ul className='nav nav-tabs'>
                    <li className='nav-item'>
                        <a href='#' className='nav-link' onClick={this.onPressHomeTab}>Home</a>
                    </li>
                    <li className='nav-item'>
                        <a href='#' className='nav-link' onClick={this.onPressSessionTab}>Session</a>
                    </li>
                    <li className='nav-item'>
                        <a href='#' className='nav-link' onClick={this.onPressSearchTab}>Search</a>
                    </li>
                </ul>
            </div>
        )
    }
}

export default TabScreen;