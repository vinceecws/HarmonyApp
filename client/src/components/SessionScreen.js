import React from 'react';
import { icon_profile_image, icon_radio } from '../graphics';
import ChatFeed from './Chat/ChatFeed.js';
import QueueComponent from './Queues/QueueComponent.js';
import Spinner from './Spinner';

class SessionScreen extends React.Component {
	constructor(props){
		super(props);

		this.getSession()
		this.state = {
			loading: true,
			error: false,
			id: null,
			hostId:null,
			name: null,
			startTime: null ,
			endTime: null,
			initialQueue: null,
			actionLog: null,
			hostName: null
		}
		
	}

	getSession = () => { 
		if (this.props.match.params.sessionId){
			this.props.axiosWrapper.axiosGet("/main/session/" + this.props.match.params.sessionId, this.handleGetSession)
		}
		else {
			// Render suggestions to start a session?
		}
	}

	handleGetSession = (status,data) =>{
		var session = null;
		if(status === 200){
			session = data.data.session;

            this.setState({
        		loading:false,
        		id: session._id,
				hostId:session.hostId,
				name : session.name,
				startTime : session.startTime ,
				endTime : session.endTime,
				initialQueue: session.initialQueue,
				actionLog : session.actionLog,
				hostName : session.hostName
        	})
            
        }
        else if(status === 404){
        	console.log(status);
        	console.log(data);
        	this.setState({
        		loading:false,
        		error: true
        	})
        }
	}

    render(){
    	let renderContainer = false
    	if(!this.state.loading && !this.state.error){
    		renderContainer = 
    			<div style={{fontFamily: 'BalsamiqSans', marginLeft:'15px', height:'100%'}}>
        		<div className='row' style={{height:'100%'}}>
        			<div className='col-sm-8' style={{height:'100%'}}>
	        			<div className='row' style={{height:'22%', border: '3px solid black', borderRadius: '25px'}}>
	        				<div className='col' style={{maxWidth:'35%', height:'100%', padding:'1em'}}>
	        					<img src={icon_profile_image} style={{backgroundColor:'white',display: 'block', margin: 'auto', height:'90%',
	        									 border: '3px solid black'}}/>
	        				</div>
	        				<div className='col' style={{maxWidth:'50%', minWidth:'50%', padding:'1em', color:'white'}}>
	        					<div className='title session-title-text'>
	        						{this.state.name}

	        					</div>
	        					<div className='body-text' style={{marginTop:'30px', margin: 'auto'}}>
	        						{this.state.hostName}
	        					</div>
	        				</div>
	        				<div className='col' style={{maxWidth:'25%', textAlign: 'right', padding:'1em', minWidth:'10%',color:'white',  float:'right'}}>
	        					<div className='body-text'>LIVE<img src={icon_radio} style={{width:'30px'}}/></div>
	        					{this.state.startTime}

	        				</div>
	        			</div>
	        			<div className='row bg-color-contrasted' style={{height:'calc(78% - 40px)',overflow:'scroll',overflowX:'hidden',border: '3px solid black'}}>
	        				<ChatFeed actionLog={this.state.actionLog} />
	        			</div>
	        			<div className='row' style={{height:'40px',border: '3px solid black',backgroundColor:'white'}}>
	        				<input type='text' name='MessageSender' placeholder='Send your message here...' style={{width:'100%', display:'block'}}/>
	        			</div>
	        		</div>
	        		<div className='col-sm-4' style={{height:'100%'}}>
	        			<div className='row bg-color-contrasted title session-title-text' style={{color:'white', height:'7%', border: '3px solid black'}}>
	        				Up Next
	        			</div>
	        			<div className='row' style={{height:'43%'}}>
	        				<QueueComponent initialQueue={this.state.initialQueue}/>
	        			</div>
	        			<div className='row bg-color-contrasted title session-title-text' style={{color:'white', height:'7%', border: '3px solid black'}}>
	        				Previously Played
	        			</div>
	        			<div className='row' style={{height:'43%'}}>
	        				<QueueComponent initialQueue={this.state.initialQueue} />
	        			</div>
	        		
	        		</div>
        		</div>
        		
        	</div>

    	}
    	else if (this.state.loading && !this.state.error){
    		renderContainer = <Spinner/>
    	}
    	else{
    		renderContainer = <div style={{color:'white'}}>Error 404</div>
    	}
        return(
        	renderContainer
        	);
    }
}

export default SessionScreen;