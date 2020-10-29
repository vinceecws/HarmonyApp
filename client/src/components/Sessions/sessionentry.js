import React, { useState } from 'react';
import Ticker from 'react-ticker';
import { Row, Col, Image } from 'react-bootstrap'
import { icon_music_1 } from '../../graphics'



class SessionEntry extends React.Component{
	constructor(props){
		super(props);
		this.state = {showTicker: false}
	}
	
	handleEntryToggle = () => {
		this.setState({
			showTicker : !this.state.showTicker
		});
	}

	getListenerCountIconClass = () => {
		return this.state.showTicker ? "session-entry-listener-count-icon-on" : "session-entry-listener-count-icon"
	}

	render(){

		const showTicker = this.state.showTicker;
		let entry;
		if(showTicker){
			entry = <Ticker speed={14} mode="await">
							{({ index }) => (<h1 className='Session-Entry-Text body-text underline color-accented'>{this.props.name}</h1>)}
					</Ticker>;
		} else{
			entry = <h1 className='Session-Entry-Text body-text color-accented'>{this.props.name}</h1>;
		}
		return(
			<div onMouseEnter={this.handleEntryToggle} onMouseLeave={this.handleEntryToggle}>
				<a href={this.props.hostId} className='list-group-item list-group-item-action'>
					<Row className="session-entry-row-container">
						<Col className="session-entry-image-container">
							<Image className="session-entry-image" src={this.props.image}/>
						</Col>
						<Col className="session-entry-text-container">
							<h1 className='Session-Entry-Text body-text color-accented'>{this.props.user.name}</h1>
							{entry}
						</Col>
						<Col className="session-entry-listener-count-container">
							<Image className={this.getListenerCountIconClass()} src={icon_music_1} roundedCircle/>
							<div className="body-text color-accented">{10}</div>
						</Col>
					</Row>
				</a>
			</div>
		);
	}
}

export default SessionEntry;