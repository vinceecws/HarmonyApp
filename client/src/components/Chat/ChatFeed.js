import React from 'react';


class ChatFeed extends React.Component{
	scrollToBottom = () => {
      this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }

    componentDidMount() {
      this.scrollToBottom();
    }

    componentDidUpdate() {
      this.scrollToBottom();
}
    render(){
        var ChatEntries = this.props.chatLog; //in the future sort these out for message actions
        var ChatList = ChatEntries.map(item => {
            if(item.action === "chat"){
                if (item.data.subaction === "join") {
                    return <div style={{overflowWrap: 'break-word', padding:'1em', textAlign:'center'}}>
                        <div style={{display: 'inline-block',maxWidth:'55%'}}>{item.username + " has joined the Session."}</div>
                        </div>
                }
                else if (item.data.subaction === "leave") {
                    return <div style={{overflowWrap: 'break-word', padding:'1em', textAlign:'center'}}>
                        <div style={{display: 'inline-block',maxWidth:'55%'}}>{item.username + " has left the Session."}</div>
                        </div>
                }
                else if(this.props.user != null){
                    if(item.username === this.props.user.username){
                        return <div style={{overflowWrap: 'break-word', padding:'1em', textAlign:'right'}}>
                            <div className='body-text color-accented'>You</div>
                            <div style={{display: 'inline-block',maxWidth:'55%', padding:'1em',backgroundColor:'white', border: '3px solid black', borderRadius: '25px'}}>{item.data.message}</div>
                            </div>
                    }
                    else{
                        return <div style={{overflowWrap: 'break-word', padding:'1em'}}>
                            <div className='body-text color-accented'>{item.username}</div>
                            <div style={{display: 'inline-block',maxWidth:'55%', padding:'1em',backgroundColor:'white', border: '3px solid black', borderRadius: '25px'}}>{item.data.message}</div>
                            </div>
                    }
                }
                else{
                    return <div style={{overflowWrap: 'break-word', padding:'1em'}}>
                            <div className='body-text color-accented'>{item.username}</div>
                            <div style={{display: 'inline-block',maxWidth:'55%', padding:'1em',backgroundColor:'white', border: '3px solid black', borderRadius: '25px'}}>{item.data.message}</div>
                            </div>
                }
            }
        });
                
                
        
    	return(
    		<div style={{width:'100%'}}>
    			{ChatList}
                <div style={{ float:"left", clear: "both" }}
                     ref={(el) => { this.messagesEnd = el; }}>
                </div>
        	</div>
        );
        
    }
}

export default ChatFeed;