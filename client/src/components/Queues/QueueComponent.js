import React from 'react';
import QueueEntry from './QueueEntry.js'
import {Droppable, DragDropContext, Draggable} from 'react-beautiful-dnd'
class QueueComponent extends React.Component{
	
    render(){
        var QueueEntries = this.props.Queue;
        var QueueList;
        let renderStuff;
        if(QueueEntries!= null){
            QueueList = QueueEntries.map((item, index) => 


            <QueueEntry 
                artist={item.creator}
                title={item.name} 
                index={index}
                id={item._id}
                user={this.props.user}
                queueType={this.props.queueType}
            />

            ); 
        }
        
               
        if(this.props.isHost){
            renderStuff = <div className='list-group list-group-sessionScreen' isHost={this.props.isHost} style={{width: '100%', minWidth: '150px'}} {...this.props.provided.droppableProps} ref={this.props.provided.innerRef}>
                {QueueList}
                {this.props.provided.placeholder}
            </div>
        }
        else{
            renderStuff = 
            <div className='list-group list-group-sessionScreen' style={{width: '100%', minWidth: '150px'}}>
                {QueueList}
                            
            </div>
        }
        
    	return(
            renderStuff
                		
           
        );
        
    }
}

export default QueueComponent;