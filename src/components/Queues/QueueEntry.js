import React from 'react';
import Ticker from 'react-ticker';
import {Droppable, DragDropContext, Draggable} from 'react-beautiful-dnd'
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
			entry = <Ticker speed={14} height={27.2} mode="await" >
							{({ index }) => (<><h1 className='Session-Entry-Text body-text color-accented' >{this.props.index+1} : {this.props.title} -- {this.props.artist}</h1></>)}
					</Ticker>;

		} else{
			entry = <h1 className='Session-Entry-Text body-text color-accented'>{this.props.index+1} : {this.props.title} -- {this.props.artist}</h1>;
		}
		let renderStuff;
		if(this.props.user != null){
			renderStuff =<div  onMouseEnter={this.handleEntry} onMouseLeave={this.handleLeave} style={{width:"100%"}}>
				
				<Draggable key={this.props.id} draggableId={this.props.id} index={this.props.index} >
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