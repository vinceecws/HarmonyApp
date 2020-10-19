import React from 'react';

class SessionEntry extends React.Component{
	render(){
		return(
			<div>
				<a href={this.props.hostId}>
					{this.props.name}
				</a>
			</div>
		);
	}
}

export default SessionEntry;