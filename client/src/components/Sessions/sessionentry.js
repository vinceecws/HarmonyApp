import React from 'react';
//import Ticker from 'react-ticker';


//TODO: ellipses when not hovered over, ticker when hovered over, include host name
class SessionEntry extends React.Component{
	render(){
		return(
			<div>
				<a href={this.props.hostId} className='list-group-item list-group-item-action'>
					{/*
					<Ticker>
							{({ index }) => (<h1 className='Session-Entry-Text'>{this.props.name}</h1>)}
					</Ticker>
					*/}
				</a>
			</div>
		);
	}
}

export default SessionEntry;