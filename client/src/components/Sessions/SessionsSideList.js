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
    }

    componentDidMount = () => {
        this.topSessionsListener = this.props.sessionManager.subscribeToAction("rcvdTopSessions", this.handleSetTopSessions.bind(this))
        this.props.sessionManager.emitGetTopSessions()
    } 

    componentWillUnmount = () => {
        this.topSessionsListener = this.props.sessionManager.unsubscribeFromAction("rcvdTopSessions", this.topSessionsListener)
    }

    handleSetTopSessions = (event, sessions) => {
        this.setState({
            loading: false,
            sessions: sessions
        })
    }

    render() {
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
                            switchScreen={this.props.switchScreen}
                        /> )
                    }
                </div>
            )
        }
    }
}

export default SessionSideList;