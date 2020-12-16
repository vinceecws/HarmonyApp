import React from 'react';
import Ticker from 'react-ticker';
import {Button} from 'react-bootstrap';
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
	removeThisSong = () => {
		this.props.queueObject.removeSongFromFutureQueue(this.props.index)
		this.props.handleEmitQueueState("queue", "del_song", this.props.index)
	}
	render(){
		let entry;
		let deleteButton;
		if(this.props.queueType==="future" && this.props.isHost){
			deleteButton = <Button className="queue-entry-delete-button col" variant="primary" onClick={this.removeThisSong}>X</Button>
		}
		else{
			deleteButton = <></>
		}
		if(this.state.showTicker){
			entry = <Ticker speed={14} height={27.2} mode="await" >
							{({ index }) => (<h1 className='Session-Entry-Text body-text color-accented col' style={{height:'100%'}} >{this.props.index+1} : {this.props.title} -- {this.props.artist}</h1>)}
					</Ticker>

		} else{
			entry = <h1 className='Session-Entry-Text body-text color-accented' style={{height:'100%', overflow:'hidden'}}>{this.props.index+1} : {this.props.title} -- {this.props.artist}</h1>;
		}
		let renderStuff;
		if(this.props.isHost){
			renderStuff =<div  onMouseEnter={this.handleEntry} onMouseLeave={this.handleLeave} style={{width:"100%"}}>
				
				<Draggable key={this.props.index+this.props.id+this.props.queueType} draggableId={this.props.id+this.props.index+this.props.queueType} index={this.props.index} >
	            	{(provided) => (
					<div className='list-group-item'  {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
						<div className='col' style={{display:'inline-block', top:'11px', width:'85%'}}>
						{entry}
						</div>
						<div className='col' style={{display:'inline-block'}}>
						{deleteButton}
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