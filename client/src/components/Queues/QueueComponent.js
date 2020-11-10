import React from 'react';
import QueueEntry from './QueueEntry.js'

class QueueComponent extends React.Component{
	
    render(){
        var QueueEntries = this.props.initialQueue;
        
        var QueueList = QueueEntries.map(item => <QueueEntry
                    artist={item.artist}
                    title={item.title}
                /> );
    	return(
    		<div className='list-group list-group-sessionScreen'>
    			{QueueList}
        	</div>
        );
        
    }
}

export default QueueComponent;