import React from 'react';
import SessionEntry from './sessionentry.js'
import { genSampleSessions } from '../../test/genSamples.js'

let users = require('../../test/sampleUsers.json')


class SessionSideList extends React.Component{
    
    fetchSessions = () => {
        return genSampleSessions()
    }


    render(){
        var sessionEntries = this.fetchSessions().map(item => <SessionEntry
                    hostId={item.hostId}
                    name={item.name}
                    user={users.find(user => user.Id === item.hostId)}
                    image={item.image}
                /> );
    	return(
    		<div className='list-group list-group-session'>
    			{sessionEntries}
        	</div>
        );
        
    }
}

export default SessionSideList;