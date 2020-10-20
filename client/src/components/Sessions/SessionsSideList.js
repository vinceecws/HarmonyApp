import React from 'react';
import SessionEntry from './SessionEntry.js'

let sessions = require('../../test/sampleSessions.json')
console.log(sessions);

class SessionSideList extends React.Component{
	
    render(){

    	return(
    		<div className='list-group'>
    			<SessionEntry
    				hostId={sessions[0].hostId}
    				name={sessions[0].name}
    			/>
                <SessionEntry
                    hostId={sessions[1].hostId}
                    name={sessions[1].name}
                />
        	</div>
    	);
        
    }
}

export default SessionSideList;