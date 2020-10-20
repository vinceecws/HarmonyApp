import React from 'react';
import SessionEntry from './sessionentry.js'

let sessions = require('../../test/sampleSessions.json') //sessions json

console.log(sessions);
/*
<SessionEntry
                    hostId={sessions[0].hostId}
                    name={sessions[0].name}
                />
                <SessionEntry
                    hostId={sessions[1].hostId}
                    name={sessions[1].name}
                />
*/
class SessionSideList extends React.Component{

    render(){
        var sessionEntries = [];
        sessionEntries = sessions.map(item => <SessionEntry
                    hostId={item.hostId}
                    name={item.name}
                /> );
    	return(
    		<div className='list-group'>
    			{sessionEntries}
        	</div>
    	);
        
    }
}

export default SessionSideList;