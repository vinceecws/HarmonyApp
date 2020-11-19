import React from 'react';
import Spinner from './Spinner';
import {icon_profile_image, icon_calendar} from '../graphics';
import { Link, Route } from 'react-router-dom'
import { Form, Col, Button } from 'react-bootstrap'

class SettingsScreen extends React.Component{
	constructor (props) {
        super(props);
        this.state = {
				username: "",
                new_password:"",
                password: "",
                confirm_password: "",
                biography: "",
                privateMode: false,
                loading: true,
                profileUser: null,
                changeUsername_taken: false,
                changeUsername_validated: false,
                changePassword_validated: false

    		}
        this.fetchUser();
    }
    clearUsernameCredentials = () => {
        this.setState({
            username: "",
            password: "",
            confirm_password:""
        })
    }
    clearPasswordCredentials = () => {
        this.setState({
            new_password: "",
            password: "",
            confirm_password:""
        })
    }
    handleCloseUsernameModal = () => {
        
        this.props.history.goBack()
        this.clearUsernameCredentials()
    }
    handleCloseBiographyModal = () => {
        
        this.props.history.goBack()
        this.setState({
            biography: ""
        })
    }
    handleClosePasswordModal = () => {
        
        this.props.history.goBack()
        this.clearPasswordCredentials()
    }
    handleUsernameChange = (e) => {
        this.setState({
            username: e.target.value
        })
    }
    handleBiographyChange = (e)=>{
        const shouldSet = this.state.biography.length < 100;
        if(shouldSet){
            this.setState({
                biography: e.target.value
            })
        }
        
    }

    handleChangeUsernamePassword = (e) => {
        this.setState({
            password: e.target.value
        })
    }
    handleChangeNewPassword = (e) => {
        this.setState({
            new_password: e.target.value
        })
    }

    handleChangeUsernameConfirmPassword = (e) => {
        this.setState({
            confirm_password: e.target.value
        })
    }
    handleValidateUsername = (e) =>{
         if (this.state.username.trim() === ""){
            //Handle empty username, password or confirm password here
            console.log("Username, password and confirm password must not be empty")
            return false
        }

        


        if (/\s/g.test(this.state.username)) { //Contains whitespace
            console.log("Username Contains whitespace")
            return  false
        }

        if (!/^[0-9a-zA-Z_]+$/.test(this.state.username)) { //Contains illegal characters
            console.log("Username contains illegal characters")
            return false
        }

        if (this.state.username.trim().length < 6 || this.state.username.trim().length > 12) { //Invalid length
            console.log("Username has invalid length")
            return false
        }
        return true
    }
    handleValidateNewPassword = (e) =>{
        if (/\s/g.test(this.state.new_password)) { //Contains whitespace
            return false
        }

        if (!/^[0-9a-zA-Z_!@#$%^&*]+$/.test(this.state.new_password)) { //Contains illegal characters
            return false
        }

        if (this.state.new_password.trim().length < 6 || this.state.new_password.trim().length > 12) { //Invalid length
            return false
        }

        return true
    }
    handleValidatePassword = (e) =>{
        if (/\s/g.test(this.state.password)) { //Contains whitespace
            return false
        }

        if (!/^[0-9a-zA-Z_!@#$%^&*]+$/.test(this.state.password)) { //Contains illegal characters
            return false
        }

        if (this.state.password.trim().length < 6 || this.state.password.trim().length > 12) { //Invalid length
            return false
        }

        return true
    }
    handleValidateChangePasswordConfirmPassword = (e) => {
        if (this.handleValidatePassword() && this.state.password === this.state.confirm_password) {
            return true
        }
        return false
    }

    handleInvalidateChangePasswordSignUpConfirmPassword = () => {
        if (this.handleValidatePassword()  && !(this.state.password === this.state.confirm_password)) {
            return true
        }
        return false
    }

    validateNewPassword = () => {
        if (this.handleValidateNewPassword() && this.handleValidatePassword() && this.handleValidateChangePasswordConfirmPassword()) {
            return true
        }
        return false
    }
    validateNewUsername = () => {
        if (this.handleValidateUsername() && this.handleValidatePassword()) {
            return true
        }
        return false
    }
    handleUsername = (e) => {
        e.preventDefault()
        if (this.validateNewUsername()) {

            this.props.axiosWrapper.axiosPost('/main/settings/changeUsername', {
                    password: this.state.password,
                    username: this.state.username
                    
            }, (function(res, data) {
                if (data.success) {
                    
                    this.props.history.push('/main/settings')
                
                    console.log(data.message)
                }
                else {
                    this.setState({
                        changeUsername_validated: true,
                        changeUsername_taken: true
                    })
                }
            }).bind(this), true)
        }
        else {
            this.setState({
                changeUsername_validated: true,
                changeUsername_taken: false
            })
        }
    }
    handleBiography = (e) => {
        

        this.props.axiosWrapper.axiosPost('/main/settings/changeBiography', {
                
                biography: this.state.biography
                
        }, (function(res, data) {
            if (data.success) {
                
                this.props.history.push('/main/settings')
               
                
            }
            else {
                // Handle username taken prompting here
                console.log("Biography was not updated")
            }
        }).bind(this), true)
    }
    handlePassword = (e) => {
        e.preventDefault();
        if(this.validateNewPassword()){
            this.props.axiosWrapper.axiosPost('/main/settings/changePassword', {
                    
                    password: this.state.password,
                    new_password: this.state.new_password
                    
            }, (function(res, data) {
                if (data.success) {
                    
                    this.props.history.push('/main/settings')
                    this.clearPasswordCredentials();
                    
                }
                else {
                    // Handle username taken prompting here
                    console.log("Password was not updated")
                    this.setState({
                        changePassword_validated: true
                    });
                    
                }
            }).bind(this), true)
        
        }
        else{
            this.setState({
                changePassword_validated: true
            });

        }
        
    }
    getPrivateMode = () =>{
    	return this.state.user.privateMode;
    }
    fetchUser = () => {
        this.props.axiosWrapper.axiosGet('/main/settings', (function(res, data) {
            console.log(data);
            if (data.success) {
                console.log('Success!')
                this.setState({
                    profileUser: data.data.user,
                    loading: false
                })
                console.log(this.state.profileUser);
            }
        }).bind(this), true)
    }
	render(){
        if (this.state.loading) {
            return <Spinner/>
        }
        else {
            return (
            		<div style={{fontFamily: 'BalsamiqSans', maxWidth:'100%', padding:'1em'}}>
                        <div className='body-text color-contrasted'>SETTINGS</div>
            			<div className='row'>
                            <div style={{position: 'relative', left:'15px', height:'30px'}}>
                                    <input type="checkbox" id="customSwitch1" className='checkbox'/>
                                    <label for='customSwitch1' className='switch'></label>
                                    <label style={{position:'relative',bottom:'12px', left:'15px', color:'white'}}>Private Mode</label>
                            </div>
                            
            			</div>
                        <div className='row' style={{position: 'relative', left:'15px', height:'30px', color:'white'}}>
                            <label>Private mode allows you to listen to songs and collections without creating a public session.</label>
                        </div>
                        <div className='row' style={{position: 'relative', height:'30px'}}>
                            <div className='col'>
                                <Link to={'/main/settings/changeUsername'}>
                                    <button data-toggle='modal' data-target='#changeUsernameModal'>Change Username</button><br/>
                                </Link>
                            </div>
                        </div>
                        <div className='row' style={{position: 'relative', height:'30px', color:'white'}}>
                            <label style={{position:'relative',bottom:'0px', left:'15px'}}>Change the name that is displayed on your profile.</label>
                        </div>
                        <div className='row'>
                            <div className='col' style={{color:'white'}}>
                                <Link to={'/main/settings/changePassword'}>
                                    <button data-toggle='modal' data-target='#changePasswordModal'>Change Password</button><br/>
                                </Link>
                            </div>
                        </div>
                        <div className='row' style={{position: 'relative', height:'30px', color:'white'}}>
                            <label style={{position:'relative',bottom:'0px', left:'15px'}}>Change your password. Requires your current password.</label>
                        </div>
                        <div className='row'>
                            <div className='col' style={{color:'white'}}>
                                <Link to={'/main/settings/changeBiography'}>
                                    <button data-toggle='modal' data-target='#changeBiographyModal'>Change Biography</button><br/>
                                </Link>
                            </div>
                        </div>
                        <div className='row' style={{position: 'relative', height:'30px', color:'white'}}>
                            <label style={{position:'relative',bottom:'0px', left:'15px'}}>Change the biography that is displayed on your profile.</label>
                        </div>
                        {/* Modal */}
                        <Route path={'/main/settings/changeUsername'} render={() => { 
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
                                                
                                            <Form noValidate onSubmit={this.handleUsername}>
                                            <Form.Row>
                                                <Form.Group as={Col} controlId="username">
                                                    <Form.Label>Username</Form.Label>
                                                    <Form.Control
                                                        required
                                                        value={this.state.username}
                                                        type="text"
                                                        placeholder="Username"
                                                        onChange={this.handleUsernameChange}
                                                        isValid={this.handleValidateUsername()}
                                                        isInvalid={this.state.changeUsername_validated && !this.handleValidateUsername()}
                                                    />
                                                    <Form.Text muted>
                                                        Your username must contain 6 to 12 alphanumerical characters.
                                                    </Form.Text>
                                                    <Form.Control.Feedback>OK!</Form.Control.Feedback>
                                                    <Form.Control.Feedback type="invalid">
                                                        {this.state.changeUsername_taken ? "Username is taken." : "Invalid username."}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Form.Row>
                                            <Form.Row>
                                                <Form.Group as={Col} controlId="password">
                                                    <Form.Label>Password</Form.Label>
                                                    <Form.Control
                                                        required
                                                        value={this.state.password}
                                                        type="password"
                                                        placeholder="Password"
                                                        onChange={this.handleChangeUsernamePassword}
                                                        isValid={this.handleValidatePassword()}
                                                        isInvalid={this.state.changePassword_validated && !this.handleValidatePassword()}
                                                    />
                                                    <Form.Text muted>
                                                        Your password must contain 6 to 12 alphanumerical or special characters.
                                                    </Form.Text>
                                                    <Form.Control.Feedback type="invalid">
                                                        Invalid password.
                                                    </Form.Control.Feedback>
                                                    <Form.Control.Feedback>OK!</Form.Control.Feedback>
                                                </Form.Group>
                                            </Form.Row>
                                       
                                        <Button type="submit">Submit</Button>
                                    </Form>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-default" data-dismiss="modal" onClick={data => this.handleCloseUsernameModal(data)}>Close</button>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                        )}}/>
                        {/* Modal */}
                        <Route path={'/main/settings/changeBiography'} render={() => { 
                            return(
                            <div id="changeBiographyModal" style={{position: 'relative', transform: 'translate(0, -50%)'}}>
                                <div className="modal-dialog">
                                    {/* Modal Content */}
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h3>Change Biography</h3>
                                            <button type="button" className="close" data-dismiss="modal" onClick={data => this.handleCloseBiographyModal(data)}>&times;</button>
                                        </div>
                                        <div className="modal-body">
                                            <p>Update your Biography:</p>
                                                <div onSubmit={e => this.handleBiography(e)}>
                                                    <textarea rows={10} cols={30} name='biography' placeholder='Your Biography' style={{marginBottom: '5px'}} value={this.state.biography} onChange={this.handleBiographyChange}/><br/>
                                                    <button style={{marginTop:'20px', boxShadow: '3px 3px'}} onClick={e => this.handleBiography(e)}>Submit</button>
                                                </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-default" data-dismiss="modal" onClick={data => this.handleCloseBiographyModal(data)}>Close</button>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                        )}}/>
                        {/* Modal */}
                        <Route path={'/main/settings/changePassword'} render={() => { 
                            return(
                            <div id="changePasswordModal" style={{position: 'relative', transform: 'translate(0, -50%)'}}>
                                <div className="modal-dialog">
                                    {/* Modal Content */}
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h3>Change Password</h3>
                                            <button type="button" className="close" data-dismiss="modal" onClick={data => this.handleClosePasswordModal(data)}>&times;</button>
                                        </div>
                                        <div className="modal-body">
                                            <p>Change your Password:</p>
                                                
                                                <Form noValidate onSubmit={this.handlePassword}>
                                                    <Form.Row>
                                                        <Form.Group as={Col} controlId="new_password">
                                                            <Form.Label>New Password</Form.Label>
                                                            <Form.Control
                                                                required
                                                                value={this.state.new_password}
                                                                type="password"
                                                                placeholder="New Password"
                                                                onChange={this.handleChangeNewPassword}
                                                                isValid={this.handleValidateNewPassword()}
                                                                isInvalid={this.state.changePassword_validated && !this.handleValidateNewPassword()}
                                                            />
                                                            <Form.Text muted>
                                                                Your new password must contain 6 to 12 alphanumerical characters.
                                                            </Form.Text>
                                                            <Form.Control.Feedback>OK!</Form.Control.Feedback>
                                                            <Form.Control.Feedback type="invalid">
                                                                Invalid Password.
                                                            </Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Form.Row>
                                                    <Form.Row>
                                                        <Form.Group as={Col} controlId="password">
                                                            <Form.Label>Password</Form.Label>
                                                            <Form.Control
                                                                required
                                                                value={this.state.password}
                                                                type="password"
                                                                placeholder="Password"
                                                                onChange={this.handleChangeUsernamePassword}
                                                                isValid={this.handleValidatePassword()}
                                                                isInvalid={this.state.changePassword_validated && !this.handleValidatePassword()}
                                                            />
                                                            <Form.Text muted>
                                                                Your password must contain 6 to 12 alphanumerical characters.
                                                            </Form.Text>
                                                            <Form.Control.Feedback>OK!</Form.Control.Feedback>
                                                            <Form.Control.Feedback type="invalid">
                                                                Invalid Password.
                                                            </Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Form.Row>
                                                    <Form.Row>
                                                        <Form.Group as={Col} controlId="confirm_password">
                                                            <Form.Label>Confirm Password</Form.Label>
                                                            <Form.Control
                                                                required
                                                                value={this.state.confirm_password}
                                                                type="password"
                                                                placeholder="Confirm Password"
                                                                onChange={this.handleChangeUsernameConfirmPassword}
                                                                isValid={this.handleValidateChangePasswordConfirmPassword()}
                                                                isInvalid={this.state.changePassword_validated && !this.handleInvalidateChangePasswordSignUpConfirmPassword()}
                                                            />
                                                            <Form.Text muted>
                                                                Your password must contain 6 to 12 alphanumerical characters.
                                                            </Form.Text>
                                                            <Form.Control.Feedback>OK!</Form.Control.Feedback>
                                                            <Form.Control.Feedback type="invalid">
                                                                Invalid Password.
                                                            </Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Form.Row>
                                                    <Button type="submit">Submit</Button>
                                                </Form>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-default" data-dismiss="modal" onClick={data => this.handleClosePasswordModal(data)}>Close</button>
                                        </div>
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