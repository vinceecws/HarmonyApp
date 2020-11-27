import React from 'react';
import Ticker from 'react-ticker';
class QueueEntry extends React.Component{
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
	render(){
		console.log("render called");
		let entry;
		if(this.state.showTicker){
			entry = <div><Ticker speed={14} mode="await" >
							{({ index }) => (<><h1 className='Session-Entry-Text body-text underline color-accented' >{this.props.title} -- {this.props.artist}</h1></>)}
					</Ticker></div>;

		} else{
			entry = <div onMouseEnter={this.handleEntryToggle}><h1 className='Session-Entry-Text body-text underline color-accented'>{this.props.title} -- {this.props.artist}</h1></div>;
		}
		
		return(
			<div  onMouseEnter={this.handleEntry} onMouseLeave={this.handleLeave} >
				<div className='list-group-item' style={{width:"100%"}}>
					{entry}
					
					
				</div>
			</div>
		);
	}
}

export default QueueEntry;