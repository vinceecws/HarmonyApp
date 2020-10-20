import React from 'react';


class LoginScreen extends React.Component{


    onPressContinueGuest = () => {}

    render(){
        return (
            <div className='container' style={{backgroundColor: 'lightgreen', 
                                               height: '100vh', minHeight: '100vh',
                                               width: '100vw', minWidth: '100vw'}}>
                <div className='row' style={{marginLeft: '20%'}}>
                    <div className='col' style={{marginTop: '60px'}}>
                        <div>REPLACE WITH LOGO IMAGE</div>
                    </div>
                    <div className='col' style={{marginTop: '60px', marginLeft: '10%'}}>

                        <h2 style={{marginBottom: '20px'}}>Log-in</h2>
                        <form>
                            <input type='text' name='username' placeholder='Username' style={{marginBottom: '5px'}}/><br/>
                            <input type='text' name='password' placeholder='Password'/> <br/>
                            <input type='submit' value='Log-in' style={{marginTop:'20px', boxShadow: '3px 3px'}}/>
                        </form>
                        <button className="btn btn-link" style={{marginTop: '10px'}} data-toggle='modal' data-target='#registrationModal'>Or create an account</button><br/>
                        <button style={{marginTop: '20px', boxShadow: '3px 3px', 
                                        backgroundColor: 'cornsilk', fontSize: '20px',
                                        padding: '10px 15px'}} onClick={this.onPressContinueGuest}>Continue As Guest</button>
                    </div>
                </div>

                <div className='row' style={{marginLeft: '35%'}}>
                    <h1>Listen Together</h1>
                    <div style={{border: '5px solid black', borderRadius: '10px', padding: '10px 20px',
                                 transform: 'translate(-240px,80px)'}}>REPLACE WITH IMAGES</div>
                </div>

                {/* Modal */}
                <div id="registrationModal" className="modal fade" role="dialog">
                    <div className="modal-dialog">
                        {/* Modal Content */}
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal">&times;</button>
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
                                <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}


export default LoginScreen;