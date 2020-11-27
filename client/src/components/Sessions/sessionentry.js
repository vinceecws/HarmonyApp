import React from 'react';
import Ticker from 'react-ticker';
import { Row, Col, Image } from 'react-bootstrap'
import { icon_music_1 } from '../../graphics'
import { Link } from 'react-router-dom'



class SessionEntry extends React.Component{
	constructor(props){
		super(props);
		this.state = {showTicker: false}
	}
	
	handleEntry = () => {
		this.setState({showTicker : true});
		
	}
	handleLeave = () => {
		this.setState({showTicker : false});
	}


	getStreamCount = () => {
		var count = this.props.streams
		if (count < 1000) {
			return count
		}
		else if (count < 1000000) {
			return Math.floor(count/1000) + "k"
		}
		else {
			return Math.floor(count/1000000) + "m"
		}
	}

	getListenerCountIconClass = () => {
		return this.state.showTicker ? "session-entry-stream-count-icon-on" : "session-entry-stream-count-icon"
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
			<Link className="session-entry-container" to={"/main/session/" + this.props.id} onMouseEnter={this.handleEntry} onMouseLeave={this.handleLeave}>
				<div className='list-group-item list-group-item-action'>
					<Row className="session-entry-row-container">
						<Col className="session-entry-image-container">
							<Image className="session-entry-image" src={this.props.image}/>
						</Col>
						<Col className="session-entry-text-container">
							<h1 className='Session-Entry-Text body-text color-accented'>{this.props.hostName}</h1>
							{entry}
						</Col>
						<Col className="session-entry-stream-count-container">
							<Image className={this.getListenerCountIconClass()} src={icon_music_1} roundedCircle/>
							<div className="session-entry-stream-count-text tiny-text color-accented">{this.getStreamCount()}</div>
						</Col>
					</Row>
				</div>
			</Link>
		);
	}
}

export default SessionEntry;