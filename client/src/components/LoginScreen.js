import React from 'react';
import { Link, Route } from 'react-router-dom'
import { icon_speak_2, icon_speak_1, icon_radio, icon_album, icon_disc_1, icon_disc_2, icon_music_album_1, icon_music_album_2, icon_sound_mixer_1, icon_sound_mixer_2 } from '../graphics'
import { Form, Col, Button } from 'react-bootstrap'

class LoginScreen extends React.Component{

    constructor(props) {
        super(props)
        this.state = {
            signup_validated: false,
            signup_username_taken: false,
            login_validated: false,
            signup_username: "",
            signup_password: "",
            signup_confirm_password: "",
            login_username: "",
            login_password: "",
        }
        this.checkCredentials()
    }

    checkCredentials = () => {
        this.props.axiosWrapper.axiosGet('/login', (function(res, data) {
            if (data.success) {
                this.props.handleAuthenticate(data.data.user)
                this.clearSignUpCredentials()
                this.props.history.push("/main/home")
            }
        }).bind(this), true)
    }

    clearLoginCredentials = () => {
        this.setState({
            login_username: "",
            login_password: ""
        })
    }

    clearSignUpCredentials = () => {
        this.setState({
            signup_validated: false,
            signup_username_taken: false,
            signup_username: "",
            signup_password: "",
            signup_confirm_password: ""
        })
    }

    handleCloseSignUpModal = () => {
        this.clearSignUpCredentials()
        this.props.history.goBack()
    }

    handleLoginUsernameChange = (e) => {
        this.setState({
            login_username: e.target.value
        })
    }

    handleLoginPasswordChange = (e) => {
        this.setState({
            login_password: e.target.value
        })
    }

    handleSignUpUsernameChange = (e) => {
        this.setState({
            signup_username_taken: false,
            signup_username: e.target.value
        })
    }

    handleSignUpPasswordChange = (e) => {
        this.setState({
            signup_password: e.target.value
        })
    }

    handleSignUpConfirmPasswordChange = (e) => {
        this.setState({
            signup_confirm_password: e.target.value
        })
    }

    handleValidateSignUpUsername = (e) => {
        if (this.state.signup_username_taken) { //Username is taken
            return false
        }

        if (/\s/g.test(this.state.signup_username)) { //Contains whitespace
            return false
        }

        if (!/^[0-9a-zA-Z_]+$/.test(this.state.signup_username)) { //Contains illegal characters
            return false
        }

        if (this.state.signup_username.trim().length < 6 || this.state.signup_username.trim().length > 12) { //Invalid length
            return false
        }

        return true
    }

    handleValidateSignUpPassword = (e) => {
        if (/\s/g.test(this.state.signup_password)) { //Contains whitespace
            return false
        }

        if (!/^[0-9a-zA-Z_!@#$%^&*]+$/.test(this.state.signup_password)) { //Contains illegal characters
            return false
        }

        if (this.state.signup_password.trim().length < 6 || this.state.signup_password.trim().length > 12) { //Invalid length
            return false
        }

        return true
    }

    handleValidateSignUpConfirmPassword = (e) => {
        if (this.handleValidateSignUpPassword() && this.state.signup_password === this.state.signup_confirm_password) {
            return true
        }
        return false
    }

    handleInvalidateSignUpConfirmPassword = () => {
        if (this.handleValidateSignUpPassword() && !(this.state.signup_password === this.state.signup_confirm_password)) {
            return true
        }
        return false
    }

    validateSignUp = () => {
        if (this.handleValidateSignUpUsername() && this.handleValidateSignUpPassword() && this.handleValidateSignUpConfirmPassword()) {
            return true
        }
        return false
    }

    handleSignUp = (e) => {
        e.preventDefault()
        if (this.validateSignUp()) {
            this.props.axiosWrapper.axiosPost('/login/signup', {
                username: this.state.signup_username,
                password: this.state.signup_password
            }, (function(res, data) {
                if (data.success) {
                    this.clearSignUpCredentials()
                    this.props.handleAuthenticate(data.data.user)
                    this.props.history.push("/main/home")
                }
                else {
                    this.setState({
                        signup_validated: true,
                        signup_username_taken: true
                    })
                }
            }).bind(this))
        }
        else {
            this.setState({
                signup_validated: true,
                signup_username_taken: false
            })
        }
    }

    handleLogin = (e) => {
        if (this.state.login_username.trim() === "" || this.state.login_password.trim() === ""){
            //Handle empty username or password here
            console.log("Username and password must not be empty")
            return
        }

        this.props.axiosWrapper.axiosPost('/login', {
            username: this.state.login_username,
            password: this.state.login_password
        }, (function(res, data) {
            if (data.success) {
                this.clearLoginCredentials()
                this.props.handleAuthenticate(data.data.user)
                this.props.history.push("/main/home")
            }
            else {
                // Handle invalid username/password prompting here
                console.log(data.message)
            }
        }).bind(this))
    }

    render(){
        if (this.props.auth) {
            this.props.history.push('/main/home')
        }
        return (
            <div className='container' style={{backgroundColor: 'lightgreen', 
                                               height: '100vh', minHeight: '100vh',
                                               width: '100vw', minWidth: '100vw'}}>
                <div className='row' style={{marginLeft: '20%'}}>
                    <div className='col' style={{marginTop: '60px'}}>
                        <div>
                            <img style={{maxHeight: '280px'}} src={icon_music_album_1}></img>
                        </div>
                    </div>
                    <div className='col' style={{marginTop: '60px', marginLeft: '10%'}}>

                        <h2 style={{marginBottom: '20px'}}>Log-in</h2>
                        <div>
                            <input type='text' name='username' placeholder='Username' style={{marginBottom: '5px'}} onChange={this.handleLoginUsernameChange} value={this.state.login_username}/><br/>
                            <input type='password' name='password' placeholder='Password' onChange={this.handleLoginPasswordChange} value={this.state.login_password}/> <br/>
                            <button style={{marginTop:'20px', boxShadow: '3px 3px'}} onClick={e => this.handleLogin(e)}>Log-In</button>
                        </div>
                        {}
                        <Link to={'/login/signup'}>
                            <button className="btn btn-link" style={{marginTop: '10px'}} data-toggle='modal' data-target='#registrationModal'>Or create an account</button><br/>
                        </Link>
                        <Link to="/main" style={{marginTop: '20px', boxShadow: '3px 3px', 
                                        backgroundColor: 'cornsilk', fontSize: '20px',
                                        padding: '10px 15px'}}>Continue As Guest</Link>
                    </div>
                </div>

                <div className='row' style={{minWidth: '100vw', marginTop: '3%'}}>
                    <div className='row' style={{marginLeft: '40%'}}>
                        <h1>Listen Together</h1>
                    </div>
                    <div className='row' style={{marginTop: '2%', marginLeft: '25%'}}>
                    <div style={{display: 'flex', justifyContent: 'center', padding: '10px 20px'}}>
                        <img style={{maxHeight: '80px', marginRight: '5%'}} src={icon_disc_2}></img>
                        <img style={{maxHeight: '80px', marginRight: '5%'}} src={icon_music_album_2}></img>
                        <img style={{maxHeight: '80px', marginRight: '5%'}} src={icon_speak_1}></img>
                        <img style={{maxHeight: '80px', marginRight: '5%'}} src={icon_radio}></img>
                        <img style={{maxHeight: '80px', marginRight: '5%'}} src={icon_album}></img>
                        <img style={{maxHeight: '80px', marginRight: '5%'}} src={icon_sound_mixer_1}></img>
                        <img style={{maxHeight: '80px', marginRight: '5%'}} src={icon_disc_1}></img>
                        <img style={{maxHeight: '80px', marginRight: '5%'}} src={icon_speak_2}></img>
                        <img style={{maxHeight: '80px', marginRight: '5%'}} src={icon_sound_mixer_2}></img>
                    </div>
                    </div>
                </div>

                {/* Modal */}
                <Route path={'/login/signup'} render={() => { 
                    return(
                    <div id="signup-modal">
                        <div className="modal-dialog">
                            {/* Modal Content */}
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h3>Sign-Up</h3>
                                    <button type="button" className="close" data-dismiss="modal" onClick={data => this.handleCloseSignUpModal(data)}>&times;</button>
                                </div>
                                <div className="modal-body">
                                    <p>Create A New Account:</p>
                                    <Form noValidate onSubmit={this.handleSignUp}>
                                        <Form.Row>
                                            <Form.Group as={Col} controlId="username">
                                                <Form.Label>Username</Form.Label>
                                                <Form.Control
                                                    required
                                                    value={this.state.signup_username}
                                                    type="text"
                                                    onChange={this.handleSignUpUsernameChange}
                                                    placeholder="Username"
                                                    isValid={this.handleValidateSignUpUsername()}
                                                    isInvalid={this.state.signup_validated && !this.handleValidateSignUpUsername()}
                                                />
                                                <Form.Text muted>
                                                    Your username must contain 6 to 12 alphanumerical characters.
                                                </Form.Text>
                                                <Form.Control.Feedback>OK!</Form.Control.Feedback>
                                                <Form.Control.Feedback type="invalid">
                                                    {this.state.signup_username_taken ? "Username is taken." : "Invalid username."}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Form.Row>
                                        <Form.Row>
                                            <Form.Group as={Col} controlId="password">
                                                <Form.Label>Password</Form.Label>
                                                <Form.Control
                                                    required
                                                    value={this.state.signup_password}
                                                    type="password"
                                                    onChange={this.handleSignUpPasswordChange}
                                                    isValid={this.handleValidateSignUpPassword()}
                                                    isInvalid={this.state.signup_validated && !this.handleValidateSignUpPassword()}
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
                                        <Form.Row>
                                            <Form.Group as={Col} controlId="confirm_password">
                                                <Form.Label>Confirm Password</Form.Label>
                                                <Form.Control
                                                    required
                                                    value={this.state.signup_confirm_password}
                                                    type="password"
                                                    onChange={this.handleSignUpConfirmPasswordChange}
                                                    isValid={this.handleValidateSignUpConfirmPassword()}
                                                    isInvalid={this.state.signup_validated && this.handleInvalidateSignUpConfirmPassword()}
                                                />
                                                <Form.Control.Feedback>Great!</Form.Control.Feedback>
                                                <Form.Control.Feedback type="invalid">
                                                    Passwords do not match.
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Form.Row>
                                        <Button type="submit">Sign Up</Button>
                                    </Form>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default" data-dismiss="modal" onClick={data => this.handleCloseSignUpModal(data)}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}}/>
            </div>
        )
    }
}


export default LoginScreen;