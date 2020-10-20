import React from 'react';

class SessionEntry extends React.Component{
	render(){
		return(
			<div>
				<a href={this.props.hostId} className='list-group-item list-group-item-action'>
					{this.props.name}
				</a>
			</div>
		);
	}
}

export default SessionEntry;