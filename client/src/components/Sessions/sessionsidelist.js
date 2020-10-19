import React from 'react';
import SessionEntry from './sessionentry.js'


class SessionSideList extends React.Component{
	
    render(){
    	return(
    		<div className='Session-Side-List'>

    			<SessionEntry
    				hostId={this.props.hostId}
    				name={this.props.name}
    			/>
        	</div>
    	);
        
    }
}

export default SessionSideList;