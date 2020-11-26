import React from 'react';
import QueueEntry from './QueueEntry.js'

class QueueComponent extends React.Component{
	
    render(){
        var QueueEntries = this.props.initialQueue;
        var QueueList;
        
        QueueList = QueueEntries.map(item => <QueueEntry
            artist={item.creator}
            title={item.name}
        /> );
               
        
        
    	return(
    		<div className='list-group list-group-sessionScreen'>
    			{QueueList}
        	</div>
        );
        
    }
}

export default QueueComponent;