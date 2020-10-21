import React from 'react';
import SessionEntry from './sessionentry.js'

let sessions = require('../../test/sampleSessions.json') //sessions json
let users = require('../../test/sampleUsers.json')


class SessionSideList extends React.Component{
        render(){
        var sessionEntries = [];
        var hostUsers = [];
        sessionEntries = sessions.map(item => <SessionEntry
                    hostId={item.hostId}
                    name={item.name}
                    user={users.find(user => user.Id === item.hostId)}
                /> );
    	return(
    		<div className='list-group'>
    			{sessionEntries}
        	</div>
    	);
        
    }
}

export default SessionSideList;