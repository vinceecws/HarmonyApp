import React from 'react';
import SessionEntry from './sessionentry.js'
import { genSampleSessions } from '../../test/genSamples.js'

let users = require('../../test/sampleUsers.json')


class SessionSideList extends React.Component{
    

    handleGoToItem = () => {

    }
    
    fetchSessions = () => {
        return genSampleSessions()
    }



    render(){
        var sessionEntries = this.fetchSessions().sort((session1, session2) => session2.streams - session1.streams)
                            .filter(session => session.live ? true : false)
                            .map(session => <SessionEntry
                    id={session.id}
                    hostId={session.hostId}
                    hostName={session.hostName}
                    name={session.name}
                    image={session.image}
                    streams={session.streams}
                /> );
    	return(
    		<div className='list-group list-group-session'>
    			{sessionEntries}
        	</div>
        );
        
    }
}

export default SessionSideList;