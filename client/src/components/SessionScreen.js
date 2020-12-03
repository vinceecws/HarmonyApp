import React from 'react';
import { icon_profile_image, icon_radio } from '../graphics';
import ChatFeed from './Chat/ChatFeed.js';
import QueueComponent from './Queues/QueueComponent.js';
import Spinner from './Spinner';
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
			currentSong: null,
			pastQueue: [],
			futureQueue: [],
			chatLog: [],
			messageText: "",
		}
		
		
		
		//this.props.sessionClient.joinSession(this.props.match.params.sessionId)
	}


	componentDidMount = () => {
		this.getSession();

		this.queueActionListener = this.props.sessionClient.subscribeToAction("queue", this.handleApplyQueueState.bind(this));
		this.chatActionListener = this.props.sessionClient.subscribeToAction("chat", this.handleApplyChatLog.bind(this))
		this.sessionActionListener = this.props.sessionClient.subscribeToAction("session", this.handleApplySessionState.bind(this))

		this.futureQueueChangeListener = this.props.queue.subscribeToEvent("futureQueueChange", this.handleQueueStateChange.bind(this));
	}

	componentWillUnmount = () => {
		this.chatActionListener = this.props.sessionClient.unsubscribeFromAction("chat", this.chatActionListener)
		this.sessionActionListener = this.props.sessionClient.unsubscribeFromAction("session", this.sessionActionListener)
		this.queueActionListener = this.props.sessionClient.unsubscribeFromAction("queue", this.queueActionListener);
		
		this.futureQueueChangeListener = this.props.queue.unsubscribeFromEvent("futureQueueChange", this.futureQueueChangeListener)
	}

	componentDidUpdate = (prevProps, prevState) => {
        if (prevState.user !== this.props.user) {
            this.setState({
                user: this.props.user
            })
        }
    }

	handleApplyChatLog = (action, actionObj) =>{
		if (actionObj.action === 'chat'){
			let chatObj = {'type': 'text', 'object': {'username':actionObj.username, 
													'message':actionObj.data.message, 
													'timestamp':actionObj.timestamp}};
			this.setState({chatLog: this.state.chatLog.concat(chatObj)});
		}
	}


	handleApplySessionState = (action, actionObj) => {
		if (actionObj.action === 'session'){
			switch(actionObj.subaction){
				case 'end_session':
					this.props.sessionClient.disconnect();
					break;
				case 'change_name':
					this.handleChangeName(actionObj.data.newName);
					break;
				case 'session_state':
					this.handleSetSessionState(actionObj.data.queue_state, actionObj.data.player_state);
					break;
				case 'get-session-state':
					if(this.state.hostId === this.props.user._id){this.handleSendSessionState();}
					break;
				case 'like_session':
					break;
				default:
					console.log('Invalid subaction');
			}
		}
	}

	handleSetSessionState = (queueState, playerState) => {
		if (!this.isHost()){
			this.setState({
				currentSong: queueState.current_song,
				prevQueue: queueState.past_queue,
				futureQueue: queueState.future_queue,
			});
			//set player state?
			this.props.queue.setShuffle(playerState.shuffle);
			this.props.queue.setRepeat(playerState.repeat);
			if (playerState.play){
				this.props.playVideo();
			}
			else {
				this.props.playerAPI.pauseVideo();
			}
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
			future_queue: this.props.queue.getFutureQueue()
		}
		data.time = this.props.playerAPI.getSongTime();
		this.props.sessionClient.emitSession(this.props.username, this.props.user._id, data)
	}

	handleChangeName = (newName) =>{
		if (this.state.hostId !== this.props.user._id){
			this.setState({name: newName});
		}
	}

	handleSetPlayerTime = (time) => {
		if (this.state.hostId !== this.props.user._id){
			this.props.playerAPI.seekTo(time);
		}
	}

	changeSessionName = (newName) => {
		let actionObj = {action: 'session', }
	}

	initSessionClient = () =>{
		this.props.sessionClient.joinSession(this.state._id, this.setState({loading: false}));
	}

	getSession = () => { 
		if (this.props.match.params.sessionId){
			this.props.axiosWrapper.axiosGet("/api/session/" + this.props.match.params.sessionId, this.handleGetSession, true)
			console.log("session fetched");
		}
		else {
			// Render suggestions to start a session?
		}
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
			default:
				break
		}
	}

	handleApplyQueueState = (action, actionObj) => {
        if (this.props.currentSession && this.isHost()) {
            return
        }

        if (actionObj.action === "queue") {

            switch (actionObj.data.subaction) {
				// listen to only subactions that are not listened in Player.js
                // case "set_shuffle":
                //     this.props.queue.setShuffle(actionObj.data.state)
                // case "set_repeat":
                //     this.props.queue.setRepeat(actionObj.data.state)
                default:
                    break
            }

        }
    }
	
	onKeyPress = (e) => {

		if(e.key === "Enter" && this.state.messageText.length <= 250){
			
			
			//console.log(this.props.user);
			/*Adjust new object for new action types*/
			if(this.state.chatLog.length > 0){
				const obj = {'type':"message", 'object':{'username':this.props.user.username, 'message':this.state.messageText, 'timestamp':(this.state.chatLog[this.state.chatLog.length-1].object.timestamp)+1}};
				this.setState({
					chatLog: this.state.chatLog.concat(obj),
					messageText: ""

				})
			}
			else{
				const obj = {'type':"message", 'object':{'username':this.props.user.username, 'message':this.state.messageText, 'timestamp':100}};
				this.setState({
					chatLog: this.state.chatLog.concat(obj),
					messageText: ""

				})
			}
			
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
			}
			else if(e.source.droppableId === "pastQueue"){
				this.props.queue.moveSongFromPastQueue(e.source.index,e.destination.index);
			}
			
		}
		
	}
	handleGetSession = (status,data) => {

		if (status === 200) {
			var session = data.data.session
			var initialQueue = _.cloneDeep(data.data.session.initialQueue);
			if(initialQueue.length > 0){
				this.props.playVideo(initialQueue.shift());
			}
			
			Promise.all(initialQueue.map((songId) => {
            	return this.props.fetchVideoById(songId, true) //Initial queue of song objects
        	})).then((fetchedSongs) => {
				fetchedSongs.forEach(song => {
					console.log(song);
					this.props.queue.addSongToFutureQueue(song);
				});
            	this.setState({
	        		
	        		id: session._id,
					hostId: session.hostId,
					hostName : session.hostName,
					name: session.name,
					startTime: session.startTime,
					futureQueue: this.props.queue.getFutureQueue(),
					currentSong: this.props.queue.getCurrentSong(),
					pastQueue: this.props.queue.getPastQueue(),
					chatLog: session.actionLog
	        	})
	        	this.initSessionClient();
	        })
            
        }
        else if (status === 404) {
        	this.setState({
        		loading: false,
        		error: true
        	})
        }
	}
	isHost = () => {
        if (this.props.user) { //Logged-in
            if (this.props.currentSession) { //In a live Session
                if (this.props.user.live) { //Hosting
                    return true 
                }
                else { //Participating
                    return false
                }
            }
            else { //Private session or no session
                return true
            }
        }
        else { //Guest
            if (this.props.currentSession) { //In a live Session, participating
                return false
            }
            else {
                return true //Offline session or no session
            }
        }
    }
    isGuest = () =>{
    	return !this.props.user;
    }
    render(){
    	
    	
    	let renderContainer = false
    	if(!this.state.loading && !this.state.error && this.isHost){
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
	        					<div className='body-text'>{this.state.live}<img src={icon_radio} style={{width:'30px'}}/></div>
	        					{this.state.startTime}

	        				</div>
	        				<div className='col' style={{maxWidth:'25%', textAlign: 'right', padding:'1em', minWidth:'10%',color:'white',  float:'right'}}>
	        					<div className='body-text'>{this.state.live}<img src={icon_radio} style={{width:'30px'}}/></div>
	        					{this.state.startTime}

	        				</div>
	        			</div>
	        			<div className='row bg-color-contrasted' style={{height:'calc(78% - 40px)',overflow:'scroll',overflowX:'hidden',border: '3px solid black'}}>
	        				<ChatFeed actionLog={this.state.chatLog} user={this.props.user}  />
	        			</div>
	        			<div className='row' style={{height:'40px',border: '3px solid black',backgroundColor:'white'}}>
	        				<input disable={this.props.currentSession} type='text' name='MessageSender' placeholder='Send your message here...' onChange={this.handleTextChange} onKeyPress={this.onKeyPress} value={this.state.messageText} style={{width:'95%', display:'block'}}/>
	        				<div disable={this.props.currentSession} style={{width:'5%', display:'block', textAlign:'center'}}>{this.state.messageText.length}/250</div>
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
						                    	<QueueComponent Queue={this.state.futureQueue} fetchVideoById={this.props.fetchVideoById} provided={provided}  user={this.props.user}/>
						        			 )}
						        			   
						                </Droppable>
					                </div>
						            <div className='row bg-color-contrasted title session-title-text' style={{color:'white', height:'7%', border: '3px solid black'}}>
				        				Previously Played
				        			</div>
				        			<div className='row' style={{height:'43%', overflow:'auto'}}>
					        			<Droppable droppableId="pastQueue">
						                    {(provided) => ( 
		        								<QueueComponent Queue={this.state.pastQueue} fetchVideoById={this.props.fetchVideoById} provided={provided}  user={this.props.user}/>
		        							)}
		        							
						                </Droppable>
				        			</div>
					            </DragDropContext>
	        		</div>
        		</div>
        		
        	</div>

    	}
    	else if(!this.state.loading && !this.state.error && !this.isHost){
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
	        					<div className='body-text'>{this.state.live}<img src={icon_radio} style={{width:'30px'}}/></div>
	        					{this.state.startTime}

	        				</div>
	        			</div>
	        			<div className='row bg-color-contrasted' style={{height:'calc(78% - 40px)',overflow:'scroll',overflowX:'hidden',border: '3px solid black'}}>
	        				<ChatFeed  actionLog={this.state.chatLog} user={this.props.user}  />
	        			</div>
	        			<div className='row' style={{height:'40px',border: '3px solid black',backgroundColor:'white'}}>
	        				<input type='text' disabled={this.isGuest} name='MessageSender' placeholder='Log in or Sign up to send a message...' onChange={this.handleTextChange} onKeyPress={this.onKeyPress} value={this.state.messageText} style={{width:'100%', display:'block'}}/>
	        				<div disable={this.isGuest} style={{width:'5%', display:'block', textAlign:'center'}}>{this.state.messageText.length}/250</div>
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