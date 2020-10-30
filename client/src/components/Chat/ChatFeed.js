import React from 'react';


class ChatFeed extends React.Component{
	constructor(props){
		super(props);
		
	}
	
    render(){
        var ChatEntries = this.props.actionLog; //in the future sort these out for message actions
        
        var ChatList = ChatEntries.map(item => <div style={{overflowWrap: 'break-word', padding:'1em'}}>
        		<div className='body-text color-accented'>{item.object.username}</div>
        		<div style={{display: 'inline-block',maxWidth:'100%', padding:'1em',backgroundColor:'white', border: '3px solid black', borderRadius: '25px'}}>{item.object.message}</div>
        		</div>
                );
    	return(
    		<div>
    			{ChatList}
        	</div>
        );
        
    }
}

export default ChatFeed;