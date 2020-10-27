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
        		<div style={{fontFamily: 'BalsamiqSans',resize:'both'}}>
        			<div className='row'>
        				<div className='col-sm-2'>
        					<div style={{color: 'white', fontSize:'40px', 
        										marginTop: '20px'}}>
        										Settings
        					</div>
        					<div id='container' style={{position:'relative'}}>
        						<img id="user-profile-image" src={this.getUserImage()} style={{width: '150px', border: '3px solid',
        																					   backgroundColor: 'white'}}/>
        						
        						
        						<input type='submit' value='Edit' style={{marginTop: '110px', position: 'absolute', 
        																	  marginLeft:'-100px', boxShadow: '3px 3px'}}/>
        						
        					</div>
        				</div>
        				<div className='col-sm-10' style={{display:'inline-block'}}>
        					<div id='container' style={{marginTop: '5%', border: '3px solid', padding:'1em', backgroundColor: '#C0C0C0'}}>
        						<form>
                                    <textarea rows='7' cols='30' style={{resize: 'none'}}/>
                                    <input type='submit' value='Edit' style={{marginTop: '150px', position: 'absolute', 
        																	  marginLeft:'-60px', boxShadow: '3px 3px'}}/>
        							<div style={{ marginLeft:'400px', marginTop:'-50px'}}>
        								<label for='Birthday'style={{display:'block'}}>Birthday</label>
	        							<input type='text' name='Birthday' placeholder='10/10/1997' style={{display:'block'}}/>
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
        							<div style = {{display: 'flex' }}>
	        							<div style = {{ marginTop: '-75px'}}>
	        								<label for='Email' style={{display:'block'}}>Email</label>
	        								<input type='text' name='Email' placeholder='Email' style={{marginBottom: '50px', bottom:'-50px', display:'block'}}/>
	        								
	        							</div>
	        							
        							</div>
        								
        							
        							
        							
                                </form>
        					</div>
        				</div>
        			</div>
        		</div>
        	)
    }

}

export default SettingsScreen;