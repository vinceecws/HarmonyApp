import React from 'react';
import { sessionRoles } from '../const'
import { icon_profile_image, icon_radio } from '../graphics';
import ChatFeed from './Chat/ChatFeed.js';
import QueueComponent from './Queues/QueueComponent.js';
import Spinner from './Spinner';
import {Button} from 'react-bootstrap';
import { Droppable, DragDropContext, Draggable } from 'react-beautiful-dnd'

const _ = require('lodash')

class SessionScreen extends React.Component {
	constructor(props){
		super(props);

		this.state = {
			loading: true,
			error: false,
			_id: null,
			hostId: null,
			hostName: null,
			name: null,
			startTime: null,
			pastQueue: [],
			futureQueue: [],
			chatLog: [],
			messageText: "",
			role: sessionRoles.GUEST_NON_PARTICIPANT,
			user: this.props.user,
		}
	}


	componentDidMount = () => {

		this.queueActionListener = this.props.sessionClient.subscribeToAction("rcvdQueue", this.handleApplyQueueState.bind(this));
		this.chatActionListener = this.props.sessionClient.subscribeToAction("rcvdChat", this.handleApplyChatLog.bind(this))
		this.sessionActionListener = this.props.sessionClient.subscribeToAction("rcvdSession", this.handleApplySessionState.bind(this))

		this.futureQueueChangeListener = this.props.queue.subscribeToEvent("futureQueueChange", this.handleQueueStateChange.bind(this));
		this.pastQueueChangeListener = this.props.queue.subscribeToEvent("pastQueueChange", this.handleQueueStateChange.bind(this));
	}

	componentWillUnmount = () => {
		this.chatActionListener = this.props.sessionClient.unsubscribeFromAction("rcvdChat", this.chatActionListener)
		this.sessionActionListener = this.props.sessionClient.unsubscribeFromAction("rcvdSession", this.sessionActionListener)
		this.queueActionListener = this.props.sessionClient.unsubscribeFromAction("rcvdQueue", this.queueActionListener);
		
		this.futureQueueChangeListener = this.props.queue.unsubscribeFromEvent("futureQueueChange", this.futureQueueChangeListener);
		this.pastQueueChangeListener = this.props.queue.unsubscribeFromEvent("pastQueueChange", this.handleQueueStateChange.bind(this));
	}

	componentDidUpdate = (prevProps, prevState) => {
        if (prevState.user !== this.props.user) {
            this.setState({
                user: this.props.user
            })
		}
		
		//If screen is active and new sessionId is passed
        if (this.props.screenProps && (prevState._id !== this.props.screenProps.sessionId)) {
        	console.log(this.props.screenProps)
            this.setState({
				_id: this.props.screenProps.sessionId,
				loading: true,
            }, this.fetchNewSession) //This still has to handle quitting the current session before joining new session
        }
        
    }

	handleApplyChatLog = (action, actionObj) =>{
		console.log('apply chat log');
		if (actionObj.action === 'chat'){
			
			this.state.chatLog.push(actionObj)
			this.setState({
				chatlog: this.state.chatLog
			})
		}
	}
	fetchNewSession = () =>{
		this.props.axiosWrapper.axiosGet("/api/session/" + this.state._id, this.getSessionScenario, true);
	}

	handleApplySessionState = (action, actionObj) => {
		console.log("handle Apply called")
		console.log(actionObj);
		if (actionObj.action === 'session'){
			switch(actionObj.data.subaction){
				case 'end_session':
					this.props.sessionClient.disconnect();
					break;
				case 'change_name':
					this.handleChangeName(actionObj.data.newName);
					break;
				case 'session_state':
					this.handleSetSessionState(actionObj.data.queue_state, actionObj.data.player_state, actionObj.data.time);
					break;
				case 'get_session_state':
					if(this.state.hostId === this.props.user._id){this.handleSendSessionState();}
					break;
				case 'like_session':
					break;
				default:
					console.log('Invalid subaction');
			}
		}
	}

	handleSetSessionState = (queueState, playerState, time) => {
		if (!this.isHost() && this.state.loading){

			this.props.queue.setFutureQueue(queueState.future_queue)
			this.props.queue.setPastQueue(queueState.past_queue)
			this.props.queue.setOriginalFutureQueue(queueState.original_future_queue)

			this.props.queue.setShuffle(playerState.shuffle);
			this.props.queue.setRepeat(playerState.repeat);

			if (playerState.play){
				this.props.playVideo(queueState.current_song._id);
			}
			else {
				this.props.playVideo(queueState.current_song._id);
				this.props.playerAPI.pauseVideo();
			}
			this.props.playerAPI.seekTo(time);
			this.setState({
				loading: false
			})

		}
	}

	handleSendSessionState = () => {
		let data = {}
		data.player_state = {
			play: !this.props.playerAPI.isPaused(),
			shuffle: this.props.queue.getShuffle(),
			repeat: this.props.queue.getRepeat()
		}
		data.queue_state = {
			current_song: this.props.queue.getCurrentSong(),
			past_queue: this.props.queue.getPastQueue(),
			future_queue: this.props.queue.getFutureQueue(),
			original_future_queue: this.props.queue.getOriginalFutureQueue()
		}
		data.time = this.props.playerAPI.getCurrentTime();
		data.subaction = "session_state"
		this.props.sessionClient.emitSession(this.props.username, this.props.user._id, data)
	}

	handleChangeName = (newName) =>{
		if (this.state.hostId !== this.props.user._id){
			this.setState({name: newName});
		}
	}

	onChangeSessionName = (changedName) => {
		let data = {subaction: 'change_name', newName: changedName}
		this.props.sessionClient.emitSession(this.props.user.username, this.props.user._id, data);
		this.setState({ name: changedName });
	}

	//for host ending session
	onEndSession = () => {
		if (this.isHost()){
			
		}
	}
	placeholderChatMsg = () =>{
		if(!this.isGuest()){
			return('Send your message here...');
		}
		else{
			return('Login or Signup to send a message');
		}
	}
	initSessionClient = (sessionId, hostId) =>{
		this.props.queue.clearPastQueue()
		this.props.sessionClient.joinSession(sessionId);
		if(this.props.user){
			if(this.props.user._id === hostId){
				this.props.sessionClient.readySession()
				this.setState({
					loading: false
				})
			}
			else {
				var data =  {
					subaction: "get_session_state"
				}
				this.props.sessionClient.emitSession(this.props.user.username, this.props.user._id, data);
			}
		}
		
	}

	getSessionScenario = (status,data) => { 
		let sessionRole;
		var session = data.data.session;
		console.log(data);
		if(!this.isGuest()){
			this.props.handleUpdateUser(data.data.user);
		}
		console.log(data.data.user);
		if (this.state.user) { //User is logged in
			if (session.hostId === this.state.user._id){ 
				
				if (this.state.user.privateMode){
					sessionRole = sessionRoles.USER_PRIVATE_HOST;
				}
				else {
					sessionRole = sessionRoles.USER_PUBLIC_HOST;
				}
			}
			else { 
				console.log("not current session participant")
				if(session.live){
					sessionRole = sessionRoles.USER_PARTICIPANT;
				}
				
				
			}
			
		}
		else { //User is not logged in (guest)
			if (this.props.currentSession) { //guest is currently in a live session, check if this is different
				sessionRole = sessionRoles.GUEST_PARTICIPANT;
			}
			else { //guest is just playing songs
				sessionRole = sessionRoles.GUEST_NON_PARTICIPANT;
			}
		}
		console.log("assigned session role: "+ sessionRole);
		this.setState({
			role: sessionRole
		}, this.handleGetSession(status, data));
		
		//if (this.props.screenProps.sessionId){
		// 	this.props.axiosWrapper.axiosGet("/api/session/" + this.props.screenProps.sessionId, this.handleGetSession, true);
		// }
		
		// if (this.props.match.params.sessionId){
		// 	this.props.axiosWrapper.axiosGet("/api/session/" + this.props.match.params.sessionId, this.handleGetSession, true);
		// }
		// else {
		// 	if(this.props.user){
		// 		if(this.props.user.currentSession){
		// 			this.props.axiosWrapper.axiosGet("/api/session/" + this.props.user.currentSession, this.handleGetSession, true);
		// 		}
		// 		else{ //Logged in
		// 			this.setState({
		// 				futureQueue: this.props.queue.getFutureQueue(),
		// 				pastQueue: this.props.queue.getPastQueue(),
		// 				loading:false
		//         	});
		// 		}
		// 	}
		// 	else{ //Not logged in
		// 		this.setState({
		// 			futureQueue: this.props.queue.getFutureQueue(),
		// 			pastQueue: this.props.queue.getPastQueue(),
		// 			loading:false
	 //        	});
	        	
		// 	}
			
			
		// }
	}

	handleTextChange = (e) => {
		if(this.state.messageText.length <= 250 && !(e.target.value.length > 250)){
			this.setState({
				messageText: e.target.value
			});
		}
		
	}

	handleQueueStateChange = (event, newState) => {
		switch (event) {
			case "futureQueueChange":
				this.setState({
					futureQueue: newState
				})
				break
			case "pastQueueChange":
				this.setState({
					pastQueue: newState
				})
				break
			default:
				break
		}
	}

	handleApplyQueueState = (action, actionObj) => {
        if (this.props.currentSession && this.isHost()) {
            return
        }

        if (actionObj.action === "queue") {
        	/* move_song, move_song_from_past, add_song, del_song*/
            switch (actionObj.data.subaction) {
				// listen to only subactions that are not listened in Player.js
                 case "move_song":
					 this.props.queue.moveSongInFutureQueue(actionObj.data.from,actionObj.data.to);
					 break;
                 case "move_song_from_past":
					 this.props.queue.moveSongFromPastQueue(actionObj.data.from,actionObj.data.to);
					 break;
                 case "add_song":
					 this.props.queue.addSongToFutureQueue(actionObj.data.songId);
					 break;
                 case "del_song":
					 this.props.queue.removeSongFromFutureQueue(actionObj.data.index);
					 break;
                default:
                    break
            }

        }
    }
	
	onKeyPress = (e) => {

		if(e.key === "Enter" && this.state.messageText.length <= 250 && this.props.user){
			let data = {subaction: 'text', message: this.state.messageText};
			this.props.sessionClient.emitChat(this.props.user.username, this.props.user._id, data);
			
			//console.log(this.props.user);
			/*Adjust new object for new action types*/
			this.setState({
					messageText: ""
			})	
			
			
			
		}

	}
	handleEmitQueueState = (action, subaction, ...args) => {
        if (!(this.props.user.currentSession && this.isHost())) {
            return
        }

        var username = this.props.user.username
        var userId = this.props.user._id
        var data = {}
        
        if (action === "queue") {
            data.subaction = subaction
            if(subaction === "move_song" || subaction === "move_song_from_past"){
            	data.from = args[0];
            	data.to = args[1];
            }
            else if(subaction === "add_song"){
            	data.songId = args[0];
            
            }
            else if(subaction === "del_song"){
            	data.index = args[0];
            }
            
            this.sessionClient.emitQueue(username, userId, data);
        }
    }
	handleOnDragEnd = (e) =>{
		if(!e.destination) return;
		console.log(e);
		if(e.destination.droppableId === "futureQueue"){
			const items = Array.from(this.state.futureQueue);
			const [reorderedItem] = items.splice(e.source.index, 1);
			items.splice(e.destination.index, 0, reorderedItem);

			this.setState({
				futureQueue: items
			});
			if(e.source.droppableId ==="futureQueue"){
				this.props.queue.moveSongInFutureQueue(e.source.index,e.destination.index);
				this.handleEmitQueueState("queue", "move_song",e.source.index,e.destination.index);
			}
			else if(e.source.droppableId === "pastQueue"){
				this.props.queue.moveSongFromPastQueue(e.source.index,e.destination.index);
				this.handleEmitQueueState("queue", "move_song_from_past",e.source.index,e.destination.index);
			}
			
		}
		
	}
	handleGetSession = (status,data) => {
		console.log('handleGetSession', status, data)
		if (status === 200) {
			var session = data.data.session;
			
			if(this.isHost() && !this.isGuest()){
				
				// Promise.all(initialQueue.map((songId) => {
		  //           	return this.props.fetchVideoById(songId, true) //Initial queue of song objects
		  //       	})).then((fetchedSongs) => {
				// 		fetchedSongs.forEach(song => {
				// 			console.log(song);
				// 			this.props.queue.addSongToFutureQueue(song);
				// 		});
            	this.setState({
	        		
	        		id: session._id,
					hostId: session.hostId,
					hostName : session.hostName,
					name: session.name,
					startTime: session.startTime,
					futureQueue: this.props.queue.getFutureQueue(),
					pastQueue: this.props.queue.getPastQueue(),
					
	        	})
	        	this.initSessionClient(session._id, session.hostId);
			        
			}
			else if(!this.isHost()){
				this.setState({
			        		
		        		id: session._id,
						hostId: session.hostId,
						hostName : session.hostName,
						name: session.name,
						startTime: session.startTime,
						
				});
				if(session.live){
					this.initSessionClient(session._id, session.hostId);
				}
				
			}
			
        }
        else {
        	if(this.state.role === sessionRoles.GUEST_NON_PARTICIPANT){
	        	this.setState({
	        		loading: false,
	        		futureQueue: this.props.queue.getFutureQueue(),
			 		pastQueue: this.props.queue.getPastQueue()
	        	})
        	}
        	else{
        		this.setState({
	        		loading: false,
	        		error: true
	        	})
        	}
        	
        }
	}
	isHost = () => {
        return (this.state.role === sessionRoles.GUEST_NON_PARTICIPANT || this.state.role === sessionRoles.USER_PRIVATE_HOST || this.state.role === sessionRoles.USER_PUBLIC_HOST);
    }
    isGuest = () =>{
    	return (this.state.role === sessionRoles.GUEST_PARTICIPANT || this.state.role === sessionRoles.GUEST_NON_PARTICIPANT);
    }
    render(){
		var component
    	if(!this.state.loading && !this.state.error && this.isHost()){
    		component = 
    			<div style={{fontFamily: 'BalsamiqSans', marginLeft:'15px', height:'100%'}}>
        		<div className='row' style={{height:'100%'}}>
        			<div className='col-sm-8' style={{height:'100%'}}>
	        			<div className='row' style={{height:'22%', border: '3px solid black', borderRadius: '25px'}}>
	        				<div className='col' style={{maxWidth:'35%', height:'100%', padding:'1em'}}>
	        					<img src={icon_profile_image} style={{backgroundColor:'white',display: 'block', margin: 'auto', height:'90%', border: '3px solid black'}}/>
	        				</div>
	        				<div className='col' style={{maxWidth:'50%', minWidth:'50%',height:'100%', padding:'1em', color:'white'}}>
	        					<div className='title session-title-text'>
	        						{this.state.name}
	        					</div>
	        					<div className='body-text' style={{marginTop:'30px', margin: 'auto'}}>
	        						{this.state.hostName}
	        					</div>
	        				</div>
	        				<div className='col' style={{maxWidth:'15%', textAlign: 'right',height:'100%', padding:'1em', minWidth:'5%',color:'white',  float:'right'}}>
	        					<div className='row body-text' style={{height:'30%', display:'block', textAlign:'center'}}>{this.state.live}<img src={icon_radio} style={{width:'30px'}}/></div>
	        					<div className='row'style={{height:'30%',  display:'block', textAlign:'center'}}>{this.state.startTime}</div>
	        					<div className='row'style={{height:'30%',  display:'block', textAlign:'center'}}><Button variant="primary" onClick={this.endSession}>End Session</Button></div>
	        				</div>
	        			</div>
	        			<div className='row bg-color-contrasted' style={{height:'calc(78% - 40px)',overflow:'scroll',overflowX:'hidden',border: '3px solid black'}}>
	        				<ChatFeed chatLog={this.state.chatLog} user={this.props.user}  />
	        			</div>
	        			<div className='row' style={{height:'40px',border: '3px solid black',backgroundColor:'white'}}>
	        				<input disabled={this.isGuest()} type='text' name='MessageSender' placeholder={this.placeholderChatMsg()} onChange={this.handleTextChange} onKeyPress={this.onKeyPress} value={this.state.messageText} style={{width:'95%', display:'block'}}/>
	        				<div style={{width:'5%', display:'block', textAlign:'center', marginTop:'5px'}}>{this.state.messageText.length}/250</div>
	        			</div>
	        		</div>
	        		<div className='col-sm-4' style={{height:'100%', overflow:'auto'}}>
						<DragDropContext onDragEnd={this.handleOnDragEnd}>
							<div className='row bg-color-contrasted title session-title-text' style={{color:'white', height:'7%', border: '3px solid black'}}>
								Up Next
							</div>
							<div className='row' style={{height:'43%', overflow:'auto'}}>
								<Droppable droppableId="futureQueue">
									{(provided) => ( 
										<QueueComponent Queue={this.state.futureQueue} 	queueType="future" isHost={this.isHost} fetchVideoById={this.props.fetchVideoById} provided={provided}  user={this.props.user}/>
										)}
										
								</Droppable>
							</div>
							<div className='row bg-color-contrasted title session-title-text' style={{color:'white', height:'7%', border: '3px solid black'}}>
								Previously Played
							</div>
							<div className='row' style={{height:'43%', overflow:'auto'}}>
								<Droppable droppableId="pastQueue">
									{(provided) => ( 
										<QueueComponent Queue={this.state.pastQueue} isHost={this.isHost} queueType="past"  fetchVideoById={this.props.fetchVideoById} provided={provided}  user={this.props.user}/>
									)}
								</Droppable>
							</div>
						</DragDropContext>
	        		</div>
        		</div>
        	</div>
    	}
    	else if(!this.state.loading && !this.state.error && !this.isHost()){
    		component = 
    			<div style={{fontFamily: 'BalsamiqSans', marginLeft:'15px', height:'100%'}}>
        		<div className='row' style={{height:'100%'}}>
        			<div className='col-sm-8' style={{height:'100%'}}>
	        			<div className='row' style={{height:'22%', border: '3px solid black', borderRadius: '25px'}}>
	        				<div className='col' style={{maxWidth:'35%', height:'100%', padding:'1em'}}>
	        					<img src={icon_profile_image} style={{backgroundColor:'white',display: 'block', margin: 'auto', height:'90%', border: '3px solid black'}}/>
	        				</div>
	        				<div className='col' style={{maxWidth:'50%', minWidth:'50%', padding:'1em', color:'white'}}>
	        					<div className='title session-title-text'>
	        						{this.state.name}
	        					</div>
	        					<div className='body-text' style={{marginTop:'30px', margin: 'auto'}}>
	        						{this.state.hostName}
	        					</div>
	        				</div>
	        				<div className='col' style={{maxWidth:'15%', textAlign: 'right',height:'100%', padding:'1em', minWidth:'5%',color:'white',  float:'right'}}>
	        					<div className='row body-text' style={{height:'30%', display:'block', textAlign:'center'}}>{this.state.live}<img src={icon_radio} style={{width:'30px'}}/></div>
	        					<div className='row'style={{height:'30%',  display:'block', textAlign:'center'}}>{this.state.startTime}</div>
	        					<div className='row'style={{height:'30%',  display:'block', textAlign:'center'}}><Button variant="primary" onClick={this.leaveSession}>Leave Session</Button></div>
	        				</div>
	        			</div>
	        			<div className='row bg-color-contrasted' style={{height:'calc(78% - 40px)',overflow:'scroll',overflowX:'hidden',border: '3px solid black'}}>
	        				<ChatFeed  chatLog={this.state.chatLog} user={this.props.user}  />
	        			</div>
	        			<div className='row' style={{height:'40px',border: '3px solid black',backgroundColor:'white'}}>
	        				<input type='text' disabled={this.isGuest()} name='MessageSender' placeholder={this.placeholderChatMsg()} onChange={this.handleTextChange} onKeyPress={this.onKeyPress} value={this.state.messageText} style={{width:'100%', display:'block'}}/>
	        				<div  style={{width:'5%', display:'block', textAlign:'center', marginTop:'5px'}}>{this.state.messageText.length}/250</div>
	        			</div>
	        		</div>
	        		<div className='col-sm-4' style={{height:'100%'}}>
						<div className='row bg-color-contrasted title session-title-text' style={{color:'white', height:'7%', border: '3px solid black'}}>
							Up Next
						</div>
						<div className='row' style={{height:'43%'}}>
							<QueueComponent Queue={this.state.futureQueue} fetchVideoById={this.props.fetchVideoById}/>
						</div>
						<div className='row bg-color-contrasted title session-title-text' style={{color:'white', height:'7%', border: '3px solid black'}}>
							Previously Played
						</div>
						<div className='row' style={{height:'43%'}}>
							<QueueComponent Queue={this.state.pastQueue} fetchVideoById={this.props.fetchVideoById}/>
						</div>
	        		</div>
        		</div>
        	</div>
    	}
    	else if (this.state.loading && !this.state.error){
    		component = <Spinner/>
    	}
    	else {
    		component = <div style={{color:'white'}}>Error 404</div>
		}
		
        return(
			<div className={this.props.visible ? "visible" : "hidden"}>
                {component}
            </div>
		)
    }
}

export default SessionScreen;