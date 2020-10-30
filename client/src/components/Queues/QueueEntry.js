import React, { useState } from 'react';

class QueueEntry extends React.Component{
	constructor(props){
		super(props);
		this.state = {showTicker: false}
	}
	
	handleEntryToggle = () => this.setState({showTicker : !this.state.showTicker});
	render(){

		const showTicker = this.state.showTicker;
		let entry = <div>{this.props.title} -- {this.props.artist } &nbsp;&nbsp;&nbsp;</div>;
		return(
			<div onMouseEnter={this.handleEntryToggle} onMouseLeave={this.handleEntryToggle}>
				<div className='list-group-item list-group-item-action'>
					<h1 className='title'>{entry}</h1>
					
				</div>
			</div>
		);
	}
}

export default QueueEntry;