import React from 'react';
import { mainScreens, sessionRoles } from '../const'
import { icon_profile_image, icon_radio } from '../graphics';
import ChatFeed from './Chat/ChatFeed.js';
import QueueComponent from './Queues/QueueComponent.js';
import Spinner from './Spinner';
import {Button} from 'react-bootstrap';
import { Droppable, DragDropContext, Draggable } from 'react-beautiful-dnd'
import { Link } from 'react-router-dom'

const _ = require('lodash')

class SessionScreen extends React.Component {
	constructor(props){
		super(props);

		this.state = {
			loading: false,
			unloading: false,
			error: false,
			id: null,
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
		this.setSessionRole()
		this.queueActionListener = this.props.sessionClient.subscribeToAction("rcvdQueue", this.handleQueueAction.bind(this))
		this.chatActionListener = this.props.sessionClient.subscribeToAction("rcvdChat", this.handleChatAction.bind(this))
		this.sessionActionListener = this.props.sessionClient.subscribeToAction("rcvdSession", this.handleSessionAction.bind(this))

		this.futureQueueChangeListener = this.props.queue.subscribeToEvent("futureQueueChange", this.handleQueueStateChange.bind(this))
		this.pastQueueChangeListener = this.props.queue.subscribeToEvent("pastQueueChange", this.handleQueueStateChange.bind(this))
	}

	componentWillUnmount = () => {
		this.queueActionListener = this.props.sessionClient.unsubscribeFromAction("rcvdQueue", this.queueActionListener)
		this.chatActionListener = this.props.sessionClient.unsubscribeFromAction("rcvdChat", this.chatActionListener)
		this.sessionActionListener = this.props.sessionClient.unsubscribeFromAction("rcvdSession", this.sessionActionListener)
		
		this.futureQueueChangeListener = this.props.queue.unsubscribeFromEvent("futureQueueChange", this.futureQueueChangeListener)
		this.pastQueueChangeListener = this.props.queue.unsubscribeFromEvent("pastQueueChange", this.pastQueueChangeListener)
	}

	componentDidUpdate = (prevProps, prevState) => {
        if (prevState.user !== this.props.user) {
            this.setState({
                user: this.props.user
            })
		}

		if (!this.state.loading && !this.state.unloading) {
			if (this.props.screenProps) {
				//If screen is active and new sessionId is passed
				if (this.props.screenProps.sessionId && (prevState.id !== this.props.screenProps.sessionId)) {
					this.setState({
						id: this.props.screenProps.sessionId,
						loading: true,
					}, () => {
						this.props.axiosWrapper.axiosGet("/api/session/" + this.state.id, this.setSessionRole, true)
					}) //This still has to handle quitting the current session before joining new session
				}
				//If screen is active and no sessionId is passed
				else if (prevState.id && this.props.screenProps.sessionId == null) {
					this.setState({
						id: null,
						loading: true,
					}, () => {
						this.setSessionRole()
					})
				}

			}
			else if (prevState.id && this.state.id == null) {
				this.setState({
					loading: true
				}, () => {
					this.setSessionRole()
				})
			}
		}
	}

	/*
		Action/Event listeners
	*/
	
	handleQueueAction = (action, actionObj) => {
		if (!this.shouldReceiveActions()) {
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
    //resets the state to defaults
    

	handleChatAction = (action, actionObj) =>{
		if (actionObj.action === 'chat'){
			
			this.state.chatLog.push(actionObj)
			this.setState({
				chatlog: this.state.chatLog
			})
		}
	}

	handleSessionAction = (action, actionObj) => {
		if (actionObj.action === 'session'){
			switch(actionObj.data.subaction){
				case 'end_session':
					if (this.shouldReceiveActions()) {
						this.handleLeaveSession()
					}
					break;
				case 'change_name':
					if (this.shouldReceiveActions()) {
						this.setState({
							name: actionObj.data.newName
						})
					}
					break;
				case 'session_state':
					if (this.state.loading && this.shouldReceiveActions()) {
						this.handleReceiveSessionState(actionObj.data.queue_state, actionObj.data.player_state, actionObj.data.time)
					}
					break;
				case 'get_session_state':
					if (this.shouldEmitActions()) {
						this.handleEmitSessionState()
					}
					break;
				case 'like_session':
					break;
				default:
					console.log('Invalid subaction');
			}
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

	/*
		Subaction receiver handlers
	*/

	handleReceiveSessionState = (queueState, playerState, time) => {
		if (this.state.loading && this.shouldReceiveActions()) {

			if (queueState.current_song) {
				if (playerState.play) {
					this.props.playVideo(queueState.current_song._id)
				}
				else {
					this.props.playVideo(queueState.current_song._id)
					this.props.playerAPI.pauseVideo()
				}
				console.log("SEEK")
				this.props.playerAPI.seekTo(time)
			}
			this.setState({
				loading: false
			})
			this.props.queue.setFutureQueue(queueState.future_queue)
			this.props.queue.setPastQueue(queueState.past_queue)
			this.props.queue.setOriginalFutureQueue(queueState.original_future_queue)

			this.props.queue.setShuffle(playerState.shuffle)
			this.props.queue.setRepeat(playerState.repeat)
		}
	}

	/*
		Action emitter handlers
	*/
	handleEmitSessionState = () => {
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
		this.props.sessionClient.emitSession(this.state.username, this.state.user._id, data)
	}

	handleEmitQueueState = (action, subaction, ...args) => {
		if (!this.shouldEmitActions()) {
            return
		}
        

        var data = {}
        if (action === "queue") {
            data.subaction = subaction
            if (subaction === "move_song" || subaction === "move_song_from_past") {
            	data.from = args[0];
            	data.to = args[1];
			}
			
            else if (subaction === "add_song") {
            	data.songId = args[0];
            
			}
			
            else if (subaction === "del_song") {
            	data.index = args[0];
            }
            this.props.sessionClient.emitQueue(this.state.username, this.state.user._id, data);
        }
	}

	/*
		State change handlers
	*/

	handleEndSession = () => {
		this.props.axiosWrapper.axiosPost('/api/session/endSession', {}, (res, data) => {
			if (data.success) {
				var actionData = {
					subaction: "end_session"
				}
				this.props.sessionClient.emitSession(this.state.user.username, this.state.user._id, actionData)
				this.props.sessionClient.endSession()
				this.handleBeginTearDown(() => {
					this.props.handleUpdateUser(data.data.user, this.handleTearDown)
				})
			}
		}, true)
	}

	handleLeaveSession = () => {
		if (this.isGuest()) {
			this.props.sessionClient.leaveSession()
			this.handleBeginTearDown(() => {
				this.props.handleUpdateCurrentSession(null, this.handleTearDown)
			})
		}
		else {
			this.props.axiosWrapper.axiosPost('/api/session/leaveSession', {}, (res, data) => {
				if (data.success) {
					this.props.sessionClient.leaveSession()
					this.handleBeginTearDown(() => {
						this.props.handleUpdateUser(data.data.user, this.handleTearDown)
					})
				}
			}, true)
		}
	}

	handleChangeSessionName = (changedName) => {
		let data = {subaction: 'change_name', newName: changedName}
		this.props.sessionClient.emitSession(this.state.user.username, this.state.user._id, data);
		this.setState({ name: changedName });
	}

	handleTextChange = (e) => {
		if(e.target.value.length > 250){
            e.target.value = e.target.value.substring(0, 250)
        }
		if(this.state.messageText.length <= 250 && !(e.target.value.length > 250)){
			this.setState({
				messageText: e.target.value
			});
		}
		
	}
	
	handleChatKeyPress = (e) => {
		if (e.key === "Enter" && this.state.messageText.length <= 250 && this.state.user) {
			let data = {subaction: 'text', message: this.state.messageText};
			this.props.sessionClient.emitChat(this.state.user.username, this.state.user._id, data);
			
			/*Adjust new object for new action types*/
			this.setState({
				messageText: ""
			})	
		}
	}
	
	handleOnDragEnd = (e) => {
		if (!e.destination) return

		if (e.destination.droppableId === "futureQueue") {
			const items = Array.from(this.state.futureQueue);
			const [reorderedItem] = items.splice(e.source.index, 1);
			items.splice(e.destination.index, 0, reorderedItem);

			this.setState({
				futureQueue: items
			});
			if (e.source.droppableId ==="futureQueue") {
				this.props.queue.moveSongInFutureQueue(e.source.index,e.destination.index);
				if (this.shouldEmitActions()) {
					this.handleEmitQueueState("queue", "move_song",e.source.index,e.destination.index);
				}
			}
			else if (e.source.droppableId === "pastQueue") {
				this.props.queue.moveSongFromPastQueue(e.source.index,e.destination.index);
				if(this.shouldEmitActions()){
					this.handleEmitQueueState("queue", "move_song_from_past",e.source.index,e.destination.index);
				}
				
			}
		}
	}

	/*
		Build-up functions
	*/
	setSessionRole = (_, data) => { 
		var sessionRole
		var session
		if (data?.data?.session) { //Live Session is loaded
			session = data.data.session
			if (this.state.user) { //User is logged in
				if (String(session.hostId) === String(this.state.user._id)) { 
					if (this.state.user.privateMode) {
						sessionRole = sessionRoles.USER_PRIVATE_HOST
					}
					else {
						sessionRole = sessionRoles.USER_PUBLIC_HOST
					}
				}
				else { 
					sessionRole = sessionRoles.USER_PARTICIPANT
				}
			}
			else {
				sessionRole = sessionRoles.GUEST_PARTICIPANT
			}
		}
		else { //No Session is loaded
			if (this.state.user) {
				sessionRole = sessionRoles.USER_NON_PARTICIPANT
			}
			else {
				sessionRole = sessionRoles.GUEST_NON_PARTICIPANT
			}
		}
		this.setState({
			role: sessionRole
		}, () => {
			this.initSession(session)
		})
	}

	initSession = (session) => {
		if (session) {
			if (this.shouldEmitActions()) {
            	this.setState({
					hostId: session.hostId,
					hostName : session.hostName,
					name: session.name,
					startTime: session.startTime,
					futureQueue: this.props.queue.getFutureQueue(),
					pastQueue: this.props.queue.getPastQueue()
	        	}, this.initSessionClient)
			}
			else if (this.shouldReceiveActions()) {
				this.setState({	
					hostId: session.hostId,
					hostName: session.hostName,
					name: session.name,
					startTime: session.startTime
				}, this.initSessionClient)
			}
			else if (this.shouldIgnoreActions()) {
				this.setState({
					id: session._id,
					name: "Private Session",
					hostId: session.hostId,
					hostName: this.state.user.username,
					startTime: session.startTime,
					loading: false,
					futureQueue: this.props.queue.getFutureQueue(),
					pastQueue: this.props.queue.getPastQueue()
				})
			}
        }
        else if (this.shouldIgnoreActions()) {
			this.setState({
				name: "",
				hostName: "",
				startTime: null,
				chatLog: [],
				loading: false,
				futureQueue: this.props.queue.getFutureQueue(),
				pastQueue: this.props.queue.getPastQueue()
			})
		}
		else {
			this.setState({
				loading: false,
				error: true
			})
		}
	}

	initSessionClient = () => {
		this.props.queue.clearPastQueue()
		this.props.sessionClient.joinSession(this.state.id)

		if (this.shouldEmitActions()) {
			this.props.sessionClient.readySession()
			this.setState({
				loading: false
			})
		}
		else if (this.shouldReceiveActions()) {
			var data =  {
				subaction: "get_session_state"
			}
			if (this.isGuest()) {
				this.props.handleUpdateCurrentSession(this.state.id)
				this.props.sessionClient.emitSession("", "", data)
			}
			else {
				this.props.sessionClient.emitSession(this.state.user.username, this.state.user._id, data)
			}
		}
		else {
			this.setState({
				loading: false,
				error: true
			})
		}	
	}

	/*
		Tear-down functions
	*/

	handleBeginTearDown = (callback) => {
		this.setState({
			unloading: true
		}, callback)
	}

	handleTearDown = () => {
		this.props.playerAPI.pauseVideo()
		this.props.playerAPI.seekTo(0)
		this.props.switchScreen(mainScreens.SESSION, null)
		this.props.switchScreen(mainScreens.HOME)
		this.setState({
			id: null,
			unloading: false
		})
	}

	/*
		Check functions
	*/

	isHost = () => {
        return (this.state.role === sessionRoles.GUEST_NON_PARTICIPANT || this.state.role === sessionRoles.USER_PRIVATE_HOST || this.state.role === sessionRoles.USER_PUBLIC_HOST || this.state.role === sessionRoles.USER_NON_PARTICIPANT);
	}
	
    isGuest = () => {
    	return (this.state.role === sessionRoles.GUEST_PARTICIPANT || this.state.role === sessionRoles.GUEST_NON_PARTICIPANT) && !this.state.user;
	}
	isNonParticipant = () =>{
		return (this.state.role === sessionRoles.GUEST_NON_PARTICIPANT) || (this.state.role === sessionRoles.USER_NON_PARTICIPANT)
	}

	/*
		Users that should emit player, queue, and session actions to all participants
	*/
	shouldEmitActions = () => {
        /* True if logged-in, in a Session, hosting and not in Private Mode */
        if (this.state.role === sessionRoles.USER_PUBLIC_HOST) {
            return true
        }
        return false
    }

	/*
		Users that should receive player, queue, and session actions emitted by the host
	*/
    shouldReceiveActions = () => {
        /* True if in a live Session, and not hosting */
        if (this.state.role === sessionRoles.USER_PARTICIPANT) {
			return true
		}
		else if (this.state.role === sessionRoles.GUEST_PARTICIPANT) {
			return true
		}
		return false
	}

	/*
		Users that should not have to emit/receive any actions
	*/
	shouldIgnoreActions = () => {
		/* True if not in a public Session, or a Session */
		if (this.state.role === sessionRoles.USER_PRIVATE_HOST) {
			return true
		}
		else if (this.state.role === sessionRoles.USER_NON_PARTICIPANT) {
			return true
		}
		else if (this.state.role === sessionRoles.GUEST_NON_PARTICIPANT) {
			return true
		}
		return false
	}
	
	/*
		UI
	*/
	renderEndButton = () => {
		if (this.state.role === sessionRoles.USER_PRIVATE_HOST || this.state.role === sessionRoles.USER_PUBLIC_HOST) {
			return <div className='row'style={{height:'40%',  display:'block', textAlign:'center'}}><Button className="bg-color-harmony" variant="primary" style={{width:'60px', height:'45px' ,fontSize:'.65rem'}} onClick={this.handleEndSession}>End Session</Button></div>

		}
		else {
			return
		}
	}

	renderSuggestionButton = () =>{
		var line1;
		var line2;
		if(this.state.role === sessionRoles.GUEST_PARTICIPANT){

			line1 = "Interested in joining the conversation?"
			line2 = "Login or Sign-up to join the chat"

		}
		else if(this.state.role === sessionRoles.GUEST_NON_PARTICIPANT){
			line1 = "Want to share your collection with others?"
			line2 = "Login or Sign-up to start a session"

		}
		if(line1 && line2){
			return <div className="session-screen-empty-notice-button-container">
							<div className="subtitle color-accented" style={{position:'absolute', marginTop:'-200px'}}>
								{line1}
							</div>
							<Link  className="subtitle color-accented" to="/login">	
								<Button className="session-screen-empty-notice-button bg-color-harmony" onClick ={this.state.role === sessionRoles.GUEST_PARTICIPANT ? this.handleLeaveSession : false}>
									<div className="subtitle color-accented">
										{line2}
									</div>
								</Button>
							</Link>
						</div>
		}
		if(this.state.role === sessionRoles.USER_PRIVATE_HOST){
			return 	<div className="session-screen-empty-notice-button-container">
						<div className="subtitle color-accented" style={{position:'absolute', marginTop:'-200px'}}>
							Chat disabled for Private Session
						</div>	
					</div>
		}
		else{
			return <ChatFeed chatLog={this.state.chatLog} user={this.state.user}  />;
		}

		
	}

	formatTime = () => {
		if (!this.state.startTime) {
			return ""
		}
		var time = new Date(this.state.startTime)
        var sec = time.getSeconds()
		var min = time.getMinutes()
		var hour = time.getHours()
        return hour + ":" + String(min).padStart(2, '0') + ":" + String(sec).padStart(2, '0')
    }

    render(){
		var component
		var button
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
	        					<div className='row'style={{height:'30%',  display:'block', textAlign:'center'}}>{this.formatTime()}</div>
	        					{this.renderEndButton()}
	        				</div>
	        			</div>
	        			<div className='row bg-color-contrasted' style={{height:'calc(78% - 40px)',overflow:'scroll',overflowX:'hidden',border: '3px solid black'}}>
	        				{this.renderSuggestionButton()}
	        				
	        			</div>
	        			<div className='row' style={{height:'40px',border: '3px solid black',backgroundColor:'white'}}>
	        				
	        				<input disabled={this.isNonParticipant() || this.isGuest() || this.state.role === sessionRoles.USER_PRIVATE_HOST} type='text' name='MessageSender' placeholder={this.isGuest() ? 'Login or sign-up to join the chat' : 'Send your message here...'} onChange={this.handleTextChange} onKeyPress={this.handleChatKeyPress} value={this.state.messageText} style={{width:'95%', display:'block'}}/>
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
										<QueueComponent Queue={this.state.futureQueue} 	queueType="future" isHost={this.isHost} fetchVideoById={this.props.fetchVideoById} provided={provided}  user={this.state.user}/>
										)}
										
								</Droppable>
							</div>
							<div className='row bg-color-contrasted title session-title-text' style={{color:'white', height:'7%', border: '3px solid black'}}>
								Previously Played
							</div>
							<div className='row' style={{height:'43%', overflow:'auto'}}>
								<Droppable droppableId="pastQueue">
									{(provided) => ( 
										<QueueComponent Queue={this.state.pastQueue} isHost={this.isHost} queueType="past"  fetchVideoById={this.props.fetchVideoById} provided={provided}  user={this.state.user}/>
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
	        					<div className='row'style={{height:'30%',  display:'block', textAlign:'center'}}>{this.formatTime()}</div>
	        					<div className='row'style={{height:'40%',  display:'block', textAlign:'center'}}><Button  className="bg-color-harmony" variant="primary" style={{width:'60px', height:'45px' ,fontSize:'.65rem'}} onClick={this.handleLeaveSession}>Leave Session</Button></div>
	        				</div>
	        			</div>
	        			<div className='row bg-color-contrasted' style={{height:'calc(78% - 40px)',overflow:'scroll',overflowX:'hidden',border: '3px solid black'}}>
	        				{this.renderSuggestionButton()}
	        			
	        			</div>
	        			<div className='row' style={{height:'40px',border: '3px solid black',backgroundColor:'white'}}>
	        				
	        				<input type='text' disabled={this.isNonParticipant() || this.isGuest()} name='MessageSender' placeholder={this.isGuest() ? 'Login or sign-up to join the chat' : 'Send your message here...'} onChange={this.handleTextChange} onKeyPress={this.handleChatKeyPress} value={this.state.messageText} style={{width:'95%', display:'block'}}/>
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