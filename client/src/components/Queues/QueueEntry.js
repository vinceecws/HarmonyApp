import React from 'react';
import Ticker from 'react-ticker';
import { Draggable } from 'react-beautiful-dnd'
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
		let entry;
		if(this.state.showTicker){
			entry = <Ticker speed={14} height={27.2} mode="await" >
							{({ index }) => (<h1 className='Session-Entry-Text body-text color-accented' style={{height:'100%'}} >{this.props.index+1} : {this.props.title} -- {this.props.artist}</h1>)}
					</Ticker>;

		} else{
			entry = <h1 className='Session-Entry-Text body-text color-accented' style={{height:'100%'}}>{this.props.index+1} : {this.props.title} -- {this.props.artist}</h1>;
		}
		let renderStuff;
		if(this.props.isHost){
			renderStuff =<div  onMouseEnter={this.handleEntry} onMouseLeave={this.handleLeave} style={{width:"100%"}}>
				
				<Draggable key={this.props.index+this.props.id+this.props.queueType} draggableId={this.props.id+this.props.index+this.props.queueType} index={this.props.index} >
	            	{(provided) => (
					<div className='list-group-item'  {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
						<div>
						{entry}
						</div>

						
						
					</div>
					)} 

	        	</Draggable>

			</div>
		}
		else{
			renderStuff = <div  onMouseEnter={this.handleEntry} onMouseLeave={this.handleLeave} style={{width:"100%"}}>
				
				
					<div className='list-group-item' >
						<div>
						{entry}
						</div>

						
						
					</div>
					

			</div>
		}
		return(
			renderStuff
		);
	}
}

export default QueueEntry;