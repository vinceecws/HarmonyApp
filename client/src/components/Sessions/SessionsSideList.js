import React from 'react';
import SessionEntry from './sessionentry.js'
import Spinner from '../Spinner';


class SessionSideList extends React.Component{
    
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            sessions: []
        }
        this.initSocket()
    }

    initSocket = () => {
        if (this.props.mainSocket) {
            this.props.mainSocket.on('connect', () => {
                console.log('connected')
            })

            this.props.mainSocket.on('top-sessions', (topSessions, callback) => {
                if (topSessions) {
                    this.setState({
                        loading: false,
                        sessions: topSessions
                    })
                }
                callback({
                    status: 200
                })
            })
        }
    }

    handleGoToItem = () => {

    }

    render(){
        if (this.state.loading) {
            return <Spinner/>
        }
        else {
            return (
                <div className='list-group list-group-session'>
                    {
                        this.state.sessions.sort((session1, session2) => session2.streams - session1.streams)
                        .filter(session => session.live ? true : false)
                        .map((session, ind) => <SessionEntry
                            key={ind}
                            id={session._id}
                            hostId={session.hostId}
                            hostName={session.hostName}
                            name={session.name}
                            image={session.image}
                            streams={session.streams}
                        /> )
                    }
                </div>
            )
        }
    }
}

export default SessionSideList;