import React from 'react';
import Spinner from './Spinner';
import { Link, Route } from 'react-router-dom'
import { Form, Col, Button } from 'react-bootstrap'

const _ = require('lodash')

class SettingsScreen extends React.Component{
	constructor (props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            new_password:"",
            confirm_password: "",
            biography: "",
            loading: true,
            profileUser: null,
            changeUsername_invalidPassword: false,
            changeUsername_taken: false,
            changeUsername_validated: false,
            changePassword_validated: false,
            changePassword_invalidPassword: false,
            changeBiography_validated: false,
            character_limit: 250
    	}
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (!prevProps.visible && this.props.visible) {
            if (this.props.user) {
                this.fetchUser()
            }
        }
    }

    clearUsernameCredentials = () => {
        this.setState({
            username: "",
            password: "",
            changeUsername_validated: false
        })
    }
    clearPasswordCredentials = () => {
        this.setState({
            new_password: "",
            password: "",
            confirm_password:"",
            changePassword_validated: false
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
    handlePrivateToggle = () =>{
        this.props.axiosWrapper.axiosPost('/api/settings/changePrivateMode', {
                privateMode: !this.state.profileUser.privateMode
                
        }, (function(res, data) {
            if (data.success) {
                this.props.handleUpdateUser(data.data.user);  
                this.setState({
                    profileUser: data.data.user
                })
            }
        }).bind(this), true);
        
    }
    sendPrivateToggle = () =>{
        
    }
    handleUsernameChange = (e) => {
        if(!(e.target.value.length > this.state.character_limit)){
            this.setState({
                username: e.target.value,
                changeUsername_validated: false
            })
        }

    }
    handleBiographyChange = (e) => {
        if(!(e.target.value.length > this.state.character_limit)){
            this.setState({
                biography: e.target.value
            })
        }
        
        
    }

    handleChangeUsernamePassword = (e) => {
        if(!(e.target.value.length > this.state.character_limit)){
            this.setState({
                password: e.target.value,
                changeUsername_validated: false,
                changePassword_validated: false
            })
        }
    }
    handleChangeNewPassword = (e) => {
        if(!(e.target.value.length > this.state.character_limit)){
            this.setState({
                new_password: e.target.value
            })
        }
    }

    handleChangeUsernameConfirmPassword = (e) => {
        if(!(e.target.value.length > this.state.character_limit)){
            this.setState({
            confirm_password: e.target.value
            })
        }
        
    }
    handleValidateBiography = (e) =>{
        return this.state.biography.length < this.state.character_limit;
    }
    handleValidateUsername = (e) =>{
         if (this.state.username.trim() === ""){
            return false
        }

        if (/\s/g.test(this.state.username)) { //Contains whitespace
            return  false
        }

        if (!/^[0-9a-zA-Z_]+$/.test(this.state.username)) { //Contains illegal characters
            return false
        }

        if (this.state.username.trim().length < 6 || this.state.username.trim().length > 12) { //Invalid length
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
        if (this.handleValidateNewPassword() && this.state.new_password === this.state.confirm_password) {
            return true
        }
        return false
    }

    handleInvalidateChangePasswordConfirmPassword = () => {
        if (this.handleValidateNewPassword()  && !(this.state.new_password === this.state.confirm_password)) {
            return true
        }
        return false
    }

    validateNewPassword = () => {
        if (this.handleValidateNewPassword() && this.handleValidateChangePasswordConfirmPassword()) {
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

            this.props.axiosWrapper.axiosPost('/api/settings/changeUsername', {
                    password: this.state.password,
                    username: this.state.username
                    
            }, (function(res, data) {
                if (data.success) {
                    this.props.handleUpdateUser(data.data.user);
                    this.setState({
                        changeUsername_taken: false,
                        changeUsername_invalidPassword: false
                    });
                }
                else {
                    if(data.statusCode === 409){
                        this.setState({
                            changeUsername_validated: true,
                            changeUsername_taken: true
                        });
                    }
                    else if(data.statusCode === 422){
                        this.setState({
                            changeUsername_validated: true,
                            changeUsername_invalidPassword: true,
                        });
                    }
                    
                }
            }).bind(this), true)
        }
        else {
            this.setState({
                changeUsername_validated: true,
                changeUsername_taken: false,
                changeUsername_invalidPassword: false
            })
        }
    }
    handleBiography = (e) => {
        e.preventDefault();
        if(this.state.biography.length < this.state.character_limit){
            this.props.axiosWrapper.axiosPost('/api/settings/changeBiography', {
                    
                    biography: this.state.biography
                    
            }, (function(res, data) {
                if (data.success) {
                    this.props.handleUpdateUser(data.data.user)        
                    this.setState({
                        changeBiography_validated: true
                    })
                }
            }).bind(this), true)
        }
        else{
            this.setState({
                changeBiography_validated: true
            });
        }

        
    }
    handlePassword = (e) => {
        e.preventDefault();
        if(this.validateNewPassword()){
            this.props.axiosWrapper.axiosPost('/api/settings/changePassword', {
                    
                    password: this.state.password,
                    new_password: this.state.new_password
                    
            }, (function(res, data) {
                if (data.success) {
                    this.props.handleUpdateUser(data.data.user);
                    this.setState({
                        changePassword_invalidPassword: false
                    });
                    this.clearPasswordCredentials();
                }
                else {
                    // Handle username taken prompting here
                    this.setState({
                        changePassword_validated: true,
                        changePassword_invalidPassword: true
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
    	return this.state.privateMode;
    }
    fetchUser = () => {
        this.props.axiosWrapper.axiosGet('/api/settings', (function(res, data) {
            if (data.success) {
                this.setState({
                    profileUser: data.data.user,
                    loading: false
                })
            }
        }).bind(this), true)
    }

	render() {
        var component
        if (this.state.loading) {
            component = <Spinner/>
        }
        else {
            component = (
            		<div style={{fontFamily: 'BalsamiqSans', maxWidth:'100%', padding:'1em'}}>
                        <div className='body-text color-contrasted'>SETTINGS</div>
            			<div className='row'>
                            <div style={{position: 'relative', left:'15px', height:'30px'}}>
                                    <input type="checkbox" defaultChecked={this.state.profileUser.privateMode}  id="customSwitch1" className='checkbox' onClick={this.handlePrivateToggle} value={this.state.profileUser.privateMode}/>
                                    <label for='customSwitch1' className='switch'></label>
                                    <label style={{position:'relative',bottom:'12px', left:'15px', color:'white'}}>Private Mode</label>
                            </div>
                            
            			</div>
                        <div className='row' style={{position: 'relative', left:'15px', height:'30px', color:'white'}}>
                            <label>Private mode allows you to listen to songs and collections without creating a public session.</label>
                        </div>
                        <div className='row' style={{position: 'relative', height:'30px'}}>
                            <div className='col'>
                                <Link to={'/main/changeUsername'}>
                                    <button data-toggle='modal' data-target='#changeUsernameModal'>Change Username</button><br/>
                                </Link>
                            </div>
                        </div>
                        <div className='row' style={{position: 'relative', height:'30px', color:'white'}}>
                            <label style={{position:'relative',bottom:'0px', left:'15px'}}>Change the name that is displayed on your profile.</label>
                        </div>
                        <div className='row'>
                            <div className='col' style={{color:'white'}}>
                                <Link to={'/main/changePassword'}>
                                    <button data-toggle='modal' data-target='#changePasswordModal'>Change Password</button><br/>
                                </Link>
                            </div>
                        </div>
                        <div className='row' style={{position: 'relative', height:'30px', color:'white'}}>
                            <label style={{position:'relative',bottom:'0px', left:'15px'}}>Change your password. Requires your current password.</label>
                        </div>
                        <div className='row'>
                            <div className='col' style={{color:'white'}}>
                                <Link to={'/main/changeBiography'}>
                                    <button data-toggle='modal' data-target='#changeBiographyModal'>Change Biography</button><br/>
                                </Link>
                            </div>
                        </div>
                        <div className='row' style={{position: 'relative', height:'30px', color:'white'}}>
                            <label style={{position:'relative',bottom:'0px', left:'15px'}}>Change the biography that is displayed on your profile.</label>
                        </div>
                        {/* Modal */}
                        <Route path={'/main/changeUsername'} render={() => { 
                            return(
                            <div id="changeUsernameModal" style={{position: 'relative', transform: 'translate(0, -60%)'}}>
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
                                                        isValid={this.handleValidateUsername() && !this.state.changeUsername_taken}
                                                        isInvalid={this.state.changeUsername_taken && this.state.changeUsername_validated}
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
                                                        isValid={!this.state.changeUsername_invalidPassword && this.state.changeUsername_validated}
                                                        isInvalid={this.state.changeUsername_invalidPassword && this.state.changeUsername_validated}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {this.state.changeUsername_invalidPassword ? "Wrong Password" : "Invalid password"}
                                                    </Form.Control.Feedback>
                                                    
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
                        <Route path={'/main/changeBiography'} render={() => { 
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
                                            <Form noValidate onSubmit={this.handleBiography}>
                                                <Form.Row>
                                                    <Form.Group as={Col} controlId="biography">
                                                        <Form.Control as="textarea" rows={10} cols={30}
                                                            required
                                                            value={this.state.biography}
                                                            type="biography"
                                                            placeholder="Your Biography Here"
                                                            onChange={this.handleBiographyChange}
                                                            isValid={this.handleValidateBiography()}
                                                            isInvalid={!this.handleValidateBiography()}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {this.state.biography.length}/{this.state.character_limit}
                                                        </Form.Control.Feedback>
                                                        <Form.Control.Feedback>{this.state.biography.length}/{this.state.character_limit}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Form.Row>
                                                <Button type="submit">Submit</Button>
                                            </Form>  
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-default" data-dismiss="modal" onClick={data => this.handleCloseBiographyModal(data)}>Close</button>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                        )}}/>
                        {/* Modal */}
                        <Route path={'/main/changePassword'} render={() => { 
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
                                                        <Form.Group as={Col} controlId="password">
                                                            <Form.Label>Password</Form.Label>
                                                            <Form.Control
                                                                required
                                                                value={this.state.password}
                                                                type="password"
                                                                placeholder="Password"
                                                                onChange={this.handleChangeUsernamePassword}
                                                                isValid={!this.state.changePassword_invalidPassword && this.state.changePassword_validated}
                                                                isInvalid={this.state.changePassword_invalidPassword && this.state.changePassword_validated}
                                                            />
                                                            <Form.Control.Feedback type="invalid">
                                                                {this.state.changePassword_invalidPassword ? "Wrong Password" : "Invalid password"}
                                                            </Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Form.Row>
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
                                                        <Form.Group as={Col} controlId="confirm_password">
                                                            <Form.Label>Confirm New Password</Form.Label>
                                                            <Form.Control
                                                                required
                                                                value={this.state.confirm_password}
                                                                type="password"
                                                                placeholder="New Password"
                                                                onChange={this.handleChangeUsernameConfirmPassword}
                                                                isValid={this.handleValidateChangePasswordConfirmPassword()}
                                                                isInvalid={this.state.changePassword_validated && this.handleInvalidateChangePasswordConfirmPassword()}
                                                            />
                                                            <Form.Text muted>
                                                                Your new password must contain 6 to 12 alphanumerical characters.
                                                            </Form.Text>
                                                            <Form.Control.Feedback>OK!</Form.Control.Feedback>
                                                            <Form.Control.Feedback type="invalid">
                                                                Passwords do not match.
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
            	)
        }
        
        return(
			<div className={this.props.visible ? "visible" : "hidden"}>
                {component}
            </div>
		)
    }

}

export default SettingsScreen;