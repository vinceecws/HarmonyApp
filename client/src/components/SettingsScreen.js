import React from 'react';
import Spinner from './Spinner';
import {icon_profile_image, icon_calendar} from '../graphics';
import { Link, Route } from 'react-router-dom'

class SettingsScreen extends React.Component{
	constructor (props) {
        super(props);
        this.state = {
				username: "",
                password: "",
                confirm_password: "",
                biography: "",
                privateMode: false,
                loading: true,
                profileUser: null

    		}
        this.fetchUser();
    }
    clearUsernameCredentials = () => {
        this.setState({
            username: "",
            password: "",
        })
    }
    handleCloseUsernameModal = () => {
        this.clearUsernameCredentials()
        this.props.history.goBack()
    }
    handleUsernameChange = (e) => {
        this.setState({
            username: e.target.value
        })
    }

    handlePasswordChange = (e) => {
        this.setState({
            password: e.target.value
        })
    }
    handleUsername = (e) => {
        if (this.state.username.trim() === "" || this.state.password.trim() === "" || this.state.confirm_password === ""){
            //Handle empty username, password or confirm password here
            console.log("Username, password and confirm password must not be empty")
            return
        }

        if (this.state.password !== this.state.confirm_password) {
            //Handle inconsistent password here
            console.log("Password must be the same as confirm password")
            return
        }

        this.props.axiosWrapper.axiosPost('/main/settings/'+this.props.match.params.userId+'/changeUsername', {
            username: this.state.username,
        }, (function(res, data) {
            if (data.success) {
                //this.props.handleAuthenticate(data.data.user)
                this.props.history.push("/main/settings")
            }
            else {
                // Handle username taken prompting here
                console.log(data.message)
            }
        }).bind(this))
    }
    getPrivateMode = () =>{
    	return this.state.user.privateMode;
    }
    fetchUser = () => {
        this.props.axiosWrapper.axiosGet('/main/settings/' + this.props.match.params.userId, (function(res, data) {
            console.log(data);
            if (data.success) {
                console.log('Success!')
                this.setState({
                    profileUser: data.data.user,
                    loading: false
                })
                console.log(this.state.profileUser);
            }
        }).bind(this))
    }
	render(){
        if (this.state.loading) {
            return <Spinner/>
        }
        else {
            return (
            		<div className='container' style={{fontFamily: 'BalsamiqSans', display:'inline'}}>
            			<div className='row'>
                            <div className='col' style={{color:'white'}}>
                                    <input type="checkbox" id="customSwitch1" className='checkbox'/>
                                    <label for='customSwitch1' className='switch'></label>
                                    <label style={{position:'relative',bottom:'12px', left:'15px'}}>Private Mode</label>
                            </div>
            			</div>
                        <div className='row'>
                            <div className='col' style={{color:'white'}}>
                                <Link to={'/main/settings/'+this.props.match.params.userId+'/changeUsername'}>
                                    <button data-toggle='modal' data-target='#changeUsernameModal'>Change Username</button><br/>
                                </Link>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col' style={{color:'white'}}>
                                    <input type="checkbox" id="customSwitch1" className='checkbox'/>
                                    <label for='customSwitch1' className='switch'></label>
                                    <label style={{position:'relative',bottom:'12px', left:'15px'}}>Private Mode</label>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col' style={{color:'white'}}>
                                    <input type="checkbox" id="customSwitch1" className='checkbox'/>
                                    <label for='customSwitch1' className='switch'></label>
                                    <label style={{position:'relative',bottom:'12px', left:'15px'}}>Private Mode</label>
                            </div>
                        </div>
                        {/* Modal */}
                        <Route path={'/main/settings/'+this.props.match.params.userId+'/changeUsername'} render={() => { 
                            return(
                            <div id="changeUsernameModal" style={{position: 'relative', transform: 'translate(0, -40%)'}}>
                                <div className="modal-dialog">
                                    {/* Modal Content */}
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h3>Change Username</h3>
                                            <button type="button" className="close" data-dismiss="modal" onClick={data => this.handleCloseUsernameModal(data)}>&times;</button>
                                        </div>
                                        <div className="modal-body">
                                            <p>Update your username:</p>
                                                <div onSubmit={e => this.handleUsername(e)}>
                                                    <input type='text' name='username' placeholder='Username' style={{marginBottom: '5px'}} onChange={this.handleUsernameChange}/><br/>
                                                    <input type='password' name='password' placeholder='Password' style={{marginBottom: '5px'}}/> <br/>
                                                    <input type='password' name='confirmPwd' placeholder='Confirm Password' style={{marginBottom: '5px'}}/> <br/>
                                                    <button style={{marginTop:'20px', boxShadow: '3px 3px'}} onClick={e => this.handleUsernameChange(e)}>Submit</button>
                                                </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-default" data-dismiss="modal" onClick={data => this.handleCloseUsernameModal(data)}>Close</button>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                        )}}/>
            		</div>
                    
            	);
        }
        
    }

}

export default SettingsScreen;