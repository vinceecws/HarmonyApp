import React from 'react';
import { Link, Route } from 'react-router-dom'
import {icon_speak_2, icon_speak_1, icon_radio, icon_album, icon_disc_1, icon_disc_2, icon_music_album_1, icon_music_album_2, icon_sound_mixer_1, icon_sound_mixer_2} from '../graphics'

class LoginScreen extends React.Component{
    
    onPressContinueGuest = () => {}

    render(){
        if (this.props.auth !== null) {
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
                        <form>
                            <input type='text' name='username' placeholder='Username' style={{marginBottom: '5px'}}/><br/>
                            <input type='text' name='password' placeholder='Password'/> <br/>
                            <input type='submit' value='Log-in' style={{marginTop:'20px', boxShadow: '3px 3px'}}/>
                        </form>
                        {}
                        <Link to={this.props.match.url + '/signup'}>
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
                <Route path={this.props.match.url + '/signup'} render={() => { 
                    return(
                        <div id="registrationModal" style={{position: 'relative', transform: 'translate(0, -120%)'}}>
                        <div className="modal-dialog">
                            {/* Modal Content */}
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h3>Sign-Up</h3>
                                    <button type="button" className="close" data-dismiss="modal" onClick={data => this.props.history.goBack()}>&times;</button>
                                </div>
                                <div className="modal-body">
                                    <p>Enter Your Account Information:</p>
                                    <form>
                                        <input type='text' name='username' placeholder='Username' style={{marginBottom: '5px'}}/><br/>
                                        <input type='text' name='password' placeholder='Password' style={{marginBottom: '5px'}}/> <br/>
                                        <input type='text' name='confirmPwd' placeholder='Confirm Password' style={{marginBottom: '5px'}}/> <br/>
                                        <input type='text' name='email' placeholder='Email' style={{marginBottom: '5px'}}/> <br/>
                                        <input type='text' name='confirmEml' placeholder='Confirm Email'/> <br/>
                                        <input type='submit' value='Sign Up' style={{marginTop:'20px', boxShadow: '3px 3px'}}/>
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default" data-dismiss="modal" onClick={data => this.props.history.goBack()}>Close</button>
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