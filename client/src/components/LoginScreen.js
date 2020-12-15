import React from 'react';
import { Link, Route, Redirect } from 'react-router-dom'
import { yin_yang_fill_color_harmony } from '../graphics'
import { Form, Col, Button } from 'react-bootstrap'

import { ReactComponent as IconSpeak1 } from '../graphics/music_player_pack/009-speak.svg'
import { ReactComponent as IconSpeak2 } from '../graphics/music_player_pack/018-speak.svg'
import { ReactComponent as IconRadio } from '../graphics/music_player_pack/031-radio.svg'
import { ReactComponent as IconMusicAlbum1 } from '../graphics/music_player_pack/010-music album.svg'
import { ReactComponent as IconDisc1 } from '../graphics/music_player_pack/032-disc.svg'
import { ReactComponent as IconDisc2 } from '../graphics/music_player_pack/045-disc.svg'
import { ReactComponent as IconMusicAlbum2 } from '../graphics/music_player_pack/033-music album.svg'
import { ReactComponent as IconSoundMixer1 } from '../graphics/music_player_pack/034-sound mixer.svg'
import { ReactComponent as IconSoundMixer2 } from '../graphics/music_player_pack/041-sound mixer.svg'


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
    }

    componentDidMount = () => {
        this.props.playerAPI.destroyIFrameAPI()
    }

    clearLoginCredentials = () => {
        this.setState({
            login_validated: false,
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
            this.props.axiosWrapper.axiosPost('/auth/local/signup', {
                username: this.state.signup_username,
                password: this.state.signup_password
            }, (function(res, data) {
                if (data.success) {
                    this.clearSignUpCredentials()
                    this.props.handleAuthenticate(data.data.user)
                    this.props.history.push("/main")
                }
                else {
                    this.setState({
                        signup_validated: true,
                        signup_username_taken: true
                    })
                }
            }).bind(this), true)
        }
        else {
            this.setState({
                signup_validated: true,
                signup_username_taken: false
            })
        }
    }

    handleInvalidateLogin = () => {
        return this.state.login_validated
    }

    handleLogin = (e) => {
        e.preventDefault()
        this.props.axiosWrapper.axiosPost('/auth/local/login', {
            username: this.state.login_username,
            password: this.state.login_password
        }, (function(res, data) {
            if (data.success) {
                this.clearLoginCredentials()
                this.props.handleAuthenticate(data.data.user)
                if (data.data.user.currentSession) {
                    this.props.handleUpdateCurrentSession(data.data.user.currentSession)
                }
                this.props.history.push("/main")
            }
            else {
                this.setState({
                    login_validated: true
                })
            }
        }).bind(this), true)
    }

    render(){
        if (this.props.user) {
            return <Redirect to='/main'/>
        }
        return (
            <div id='login-screen' className='container'>
                <div id='login-screen-top-container' className='row'>
                    <div id='login-screen-logo-container' className='col'>
                        <div>
                            <img style={{maxHeight: '280px'}} src={yin_yang_fill_color_harmony}></img>
                        </div>
                    </div>
                    <div id='login-screen-login-container' className='col'>
                        <div id='login-screen-login-form-container'>
                            <h2>Log-in</h2>
                            <Form noValidate onSubmit={this.handleLogin}>
                                <Form.Row>
                                    <Form.Group as={Col} controlId="login-username">
                                        <Form.Label>Username</Form.Label>
                                        <Form.Control
                                            required
                                            value={this.state.login_username}
                                            type="text"
                                            onChange={this.handleLoginUsernameChange}
                                            placeholder="Username"
                                        />
                                    </Form.Group>
                                </Form.Row>
                                <Form.Row>
                                    <Form.Group as={Col} controlId="login-password">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control
                                            required
                                            value={this.state.login_password}
                                            type="password"
                                            onChange={this.handleLoginPasswordChange}
                                            isInvalid={this.handleInvalidateLogin()}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Invalid username or password.
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Form.Row>
                                <Button type="submit" id='login-screen-login-form-container-login-button' className='bg-color-harmony'>Login</Button>
                            </Form>
                            <Link to={'/login/signup'}>
                                <button className="btn btn-link color-accented" style={{marginTop: '10px'}} data-toggle='modal' data-target='#registrationModal'>Or create an account</button><br/>
                            </Link>
                            <Link to="/main" className="bg-color-harmony color-accented" style={{marginTop: '20px', boxShadow: '3px 3px', fontSize: '20px', padding: '10px 15px'}}>Continue As Guest</Link>
                        </div>
                    </div>
                </div>
                <div id='login-screen-bottom-container' className='row'>
                    <div id='login-screen-title-container' className='row'>
                        <div id='login-screen-title'>Listen Together</div>
                    </div>
                    <div id='login-screen-graphic-container' className='row'>
                        <div className='login-screen-display-container'>
                            <IconSpeak1 className="login-screen-display-icon"/>
                            <IconSpeak2 className="login-screen-display-icon"/>
                            <IconRadio className="login-screen-display-icon"/>
                            <IconMusicAlbum1 className="login-screen-display-icon"/>
                            <IconDisc1 className="login-screen-display-icon"/>
                            <IconDisc2 className="login-screen-display-icon"/>
                            <IconMusicAlbum2 className="login-screen-display-icon"/>
                            <IconSoundMixer1 className="login-screen-display-icon"/>
                            <IconSoundMixer2 className="login-screen-display-icon"/>
                        </div>
                    </div>
                </div>

                {/* Modal */}
                <Route path={'/login/signup'} render={() => { 
                    return(
                    <div id="signup-modal">
                        <div className="modal-dialog">
                            {/* Modal Content */}
                            <div id="login-screen-signup-modal-content" className="modal-content bg-color-jet color-accented">
                                <div className="modal-header">
                                    <h3>Sign-Up</h3>
                                    <button type="button" className="close color-accented" data-dismiss="modal" onClick={data => this.handleCloseSignUpModal(data)}>&times;</button>
                                </div>
                                <div className="modal-body">
                                    <p>Create A New Account:</p>
                                    <Form noValidate onSubmit={this.handleSignUp}>
                                        <Form.Row>
                                            <Form.Group as={Col} controlId="signup-username">
                                                <Form.Label>Username</Form.Label>
                                                <Form.Control
                                                    required
                                                    value={this.state.signup_username}
                                                    type="text"
                                                    placeholder="Username"
                                                    onChange={this.handleSignUpUsernameChange}
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
                                            <Form.Group as={Col} controlId="signup-password">
                                                <Form.Label>Password</Form.Label>
                                                <Form.Control
                                                    required
                                                    value={this.state.signup_password}
                                                    type="password"
                                                    placeholder="Password"
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
                                            <Form.Group as={Col} controlId="signup-confirm-password">
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
                                        <Button type="submit" id="login-screen-signup-modal-signup-button" className="bg-color-harmony">Sign Up</Button>
                                    </Form>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default bg-color-harmony color-accented" data-dismiss="modal" onClick={data => this.handleCloseSignUpModal(data)}>Close</button>
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