import React from 'react';
import Ticker from 'react-ticker';
class QueueEntry extends React.Component{
	constructor(props){
		super(props);
		this.state = {showTicker: false}
	}
	
	handleEntryToggle = () => this.setState({showTicker : !this.state.showTicker});
	render(){

		let entry;
		if(this.state.showTicker){
			entry = <Ticker speed={14} mode="await">
							{({ index }) => (<div>{this.props.title} -- {this.props.artist}</div>)}
					</Ticker>;
		} else{
			entry = <div>{this.props.title} -- {this.props.artist}</div>;
		}
		return(
			<div onMouseEnter={this.handleEntryToggle} onMouseLeave={this.handleEntryToggle}>
				<div className='list-group-item list-group-item-action'>
					{entry}
					
					
				</div>
			</div>
		);
	}
}

export default QueueEntry;