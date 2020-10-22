import React, { useState } from 'react';
import Ticker from 'react-ticker';


//TODO: ellipses when not hovered over, ticker when hovered over
class SessionEntry extends React.Component{
	constructor(props){
		super(props);
		this.state = {showTicker: false}
	}
	
	handleEntryToggle = () => this.setState({showTicker : !this.state.showTicker});
	render(){
		const showTicker = this.state.showTicker;
		let entry;
		if(showTicker){
			entry = <Ticker>
							{({ index }) => (<h1 className='Session-Entry-Text'>{this.props.name}</h1>)}
					</Ticker>;
		} else{
			entry = <h1 className='Session-Entry-Text' >{this.props.name}</h1>;
		}
		return(
			<div onMouseEnter={this.handleEntryToggle} onMouseLeave={this.handleEntryToggle}>
				<a href={this.props.hostId} className='list-group-item list-group-item-action'>
					<h1 className='Session-Entry-Text'>{this.props.user.name}</h1>
					{entry}
				</a>
			</div>
		);
	}
}

export default SessionEntry;