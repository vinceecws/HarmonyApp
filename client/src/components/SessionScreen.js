import React from 'react';
import {icon_profile_image, icon_radio, icon_song, icon_like} from '../graphics';
import ChatFeed from './Chat/ChatFeed.js';
import Queue from './Queues/Queue.js';
/*
var formData  = new FormData();

formData.append("format", "json");
formData.append("url", "http://soundcloud.com/forss/flickermood");

var html = fetch('http://soundcloud.com/oembed', {
    method: 'POST',
    body: formData
}).then(function (response) {
    return response.json();
}).then(function (res) {
  return res.html;
});
*/
let sessions = require('../test/sampleSessions.json')
let users = require('../test/sampleUsers.json')

class SessionScreen extends React.Component {
	constructor(props){

		super(props);
		this.getSession();
		this.state = {
			
			id:this.session.id,
			hostId:this.session.hostId,
			name : this.session.name ,
			startTime : this.session.startTime ,
			endTime : this.session.endTime,
			initialQueue: this.session.initialQueue,
			actionLog : this.session.actionLog,
			host : this.getSessionHost()
		}
	}
	// the session Id is passed as a prop when a user clicks on a session to view it.
	getSession=() => {
		var session = sessions.find(session => this.props.id === session.id);
		this.session = session === undefined ? sessions[0] : session;	
	}
	getSessionHost = () => {
		return users.find(user=>this.session.hostId === user.Id);
	}
	//replace icon with the associated user profile image
    render(){
    	this.state.host = this.getSessionHost();
        return(
        	<div style={{fontFamily: 'BalsamiqSans', marginLeft:'15px', height:'100%'}}>
        		<div className='row' style={{height:'100%'}}>
        			<div className='col-sm-8' style={{height:'100%'}}>
	        			<div className='row' style={{height:'140px', border: '3px solid black', borderRadius: '25px'}}>
	        				<div className='col' style={{maxWidth:'35%'}}>
	        					<img src={icon_profile_image} style={{backgroundColor:'white',display: 'block', marginLeft: 'auto',
  																		marginRight: 'auto', marginTop:'5px', height:'120px',
	        									 border: '3px solid black'}}/>
	        				</div>
	        				<div className='col' style={{maxWidth:'50%', minWidth:'50%',color:'white'}}>
	        					<div className='title session-title-text'>
	        						{this.state.name}

	        					</div>
	        					<div className='body-text' style={{marginTop:'30px'}}>
	        						{this.state.host.name}
	        					</div>
	        				</div>
	        				<div className='col' style={{maxWidth:'25%', textAlign: 'right', minWidth:'10%',color:'white', float:'right'}}>
	        					<div className='body-text'>LIVE<img src={icon_radio} style={{width:'30px', marginLeft: 'auto',
  																		marginRight: 'auto'}}/></div>
	        					{this.state.startTime}

	        				</div>
	        			</div>
	        			<div className='row bg-color-contrasted' style={{height:'calc(100% - 40px - 140px)',overflow:'scroll',overflowX:'hidden',border: '3px solid black'}}>
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
	        				<Queue initialQueue={this.state.initialQueue}/>
	        			</div>
	        			<div className='row bg-color-contrasted title session-title-text' style={{color:'white', height:'7%', border: '3px solid black'}}>
	        				Previously Played
	        			</div>
	        			<div className='row' style={{height:'43%'}}>
	        				<Queue initialQueue={this.state.initialQueue} />
	        			</div>
	        		
	        		</div>
        		</div>
        		
        	</div>



        	);
    }
}

export default SessionScreen;