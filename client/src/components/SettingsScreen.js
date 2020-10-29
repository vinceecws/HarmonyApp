import React from 'react';
import Calendar from 'react-calendar'
import {icon_profile_image, icon_calendar} from '../graphics';


class SettingsScreen extends React.Component{
	constructor (props) {
        super(props);
        this.state = {
						user : {image: null, 
						dob: new Date(),
						username: "",
						password: "",
						email: "",
						privateMode: false}

    				}
    }
    
	getUserImage = () => {
        return this.state.user.image ? this.state.user.image : icon_profile_image;
    }
    getBirthday = () =>{
    	return this.state.user.date ? this.state.user.date : new Date();
    }
    getUsername = () => {
        return this.state.user.username ? this.state.user.username : "No name";
    }
    getPassword = () =>{
    	return this.state.user.password ? this.state.user.password : "No password";
    }
    getEmail = () =>{
    	return this.state.user.email ? this.state.user.email : "No email";
    }
    getPrivateMode = () =>{
    	return this.state.user.prvateMode;
    }
    onChange =() =>{
    	this.setState(this.state.user.date);
	}
	render(){
        return (
        		<div style={{fontFamily: 'BalsamiqSans', display:'inline'}}>
        			<div className='row'>
        				<div className='col-sm-2'>
        					<div style={{color: 'white', fontSize:'40px', 
        										marginTop: '20px'}}>
        										Settings
        					</div>
        					<div id='container' style={{position:'relative'}}>
        						<img id="user-profile-image" src={this.getUserImage()} style={{width: '200px', border: '3px solid',
        																					   backgroundColor: 'white'}}/>
        						
        						
        						<input type='submit' value='Edit' style={{marginTop: '155px', position: 'absolute', 
        																	  marginLeft:'-122px', boxShadow: '3px 3px'}}/>
        						
        					</div>
        				</div>
        				<div className='col-sm-10' style={{display:'inline-block'}}>
        					<div id='container' style={{marginTop: '5%', border: '3px solid', height:'80vh', padding:'1em',backgroundSize:'100%', backgroundColor: '#C0C0C0'}}>
        						<form>
        							<div>
        								<textarea rows='7' cols='30' style={{resize: 'none'}}/>

                                    	<input type='submit' value='Edit' style={{marginTop: '150px', position: 'absolute', 
        																	  marginLeft:'-60px', boxShadow: '3px 3px'}}/>
        								<div style={{position:'relative', marginLeft:'380px', marginTop:'-65px'}}>
	        								<label for='Birthday'style={{display:'block'}}>Birthday</label>
	        								<div style ={{display:'flex'}}>
	        									<input type='text' name='Birthday' placeholder='10/10/1997' style={{display:'block'}}/>
	        									<button>
	        										<img id="calendar" src={icon_calendar} style={{width:'25px', marginLeft:'5px', display:'inline-block'}}/>

	        									</button>
		        								
		        									

        									</div>
	        							</div>
	        							

        							</div>
        							<div style = {{ marginLeft:'85%', position:'relative', top:'-175px' }}>
	        								<input type="checkbox" id="customSwitch1" className='checkbox'/>
	        								<label for='customSwitch1' className='switch'></label>
	        								<label style={{position:'relative',bottom:'12px', left:'15px'}}>Private Mode</label>
        							</div>
        							
        							<div style = {{display: 'flex' }}>
	        							<div style = {{ marginTop: '2%'}}>
	        								<label for='Username' style={{display:'block'}}>Username</label>
	        								<input type='text' name='Username' placeholder='Username' style={{marginBottom: '90px', bottom:'-70px', display:'block'}}/>
	        								
	        							</div>
	        							<div style = {{marginLeft:'1%', marginTop: '2%'}}>
		        							<label for='Password'>Password</label>
	        								<input type='password' name='Password' placeholder='Password' style={{display:'block'}}/>
	        							</div>
        							</div>
        							<div style = {{ marginTop: '-50px'}}>
	        								<label for='Email' style={{display:'block'}}>Email</label>
	        								<input type='text' name='Email' placeholder='Email' style={{marginBottom: '50px', bottom:'-50px', display:'block'}}/>
	        								
	        						</div>
        							<input type='submit' value='Submit Changes' style={{bottom: '10%', position: 'absolute', 
        																	  marginLeft:'80%', boxShadow: '3px 3px'}}/>
        							
                                </form>
                                
        					</div>
        				</div>
        			</div>
        		</div>
        	);
    }

}

export default SettingsScreen;