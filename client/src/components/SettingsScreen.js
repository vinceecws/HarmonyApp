import React from 'react';
import {icon_profile_image} from '../graphics';

class SettingsScreen extends React.Component{
	constructor (props) {
        super(props);
    }
    state = {
        user : {image: null}
    }
	getUserImage = () => {
        return this.state.user.image ? this.state.user.image : icon_profile_image;
    }
	render(){
        return (

        		<div className="screen-container">
        			<div className='row'>
        				<div className='col'>
        					<div style={{color: 'white', fontSize:'40px', 
        										marginTop: '20px', 
        										fontFamily: 'BalsamiqSans'}}>
        										Settings
        					</div>
        					<div id='container' style={{position:'relative'}}>
        						<img id="user-profile-image" src={this.getUserImage()} style={{width: '150px', border: '3px solid',
        																					   backgroundColor: 'white'}}/>
        						
        						<div>
        							<input type='submit' value='Edit' style={{marginTop: '-40px', position: 'absolute', 
        																	  marginLeft:'50px', boxShadow: '3px 3px'}}/>
        						</div>
        					</div>
        					
        					
        				</div>
        				
        			</div>
        		</div>




        	)
    }

}

export default SettingsScreen;