import React from 'react';
import {icon_profile_image, icon_calendar, icon_album, icon_song, icon_like} from '../graphics';

let users = require('../test/sampleUsers.json')

class ProfileScreen extends React.Component{


	constructor(props){
		super(props);
		this.state = {
						user : {image: null, username: ""}

    				}

	}
	getUserImage = () => {
        return this.state.user.image ? this.state.user.image : icon_profile_image;
    }
    getUsername = () => {
        return this.state.user.username ? this.state.user.username : "No name";
    }
    getLikedSongs =()=>{}
    getLikedHosts =() => {}
    getLikedCollections = () => {}
    render(){
    	var testUser = users.find(user => user.name === 'Vincenzo');
    	return(
	        <div style={{fontFamily: 'BalsamiqSans', padding:'1em'}}>
	        	<div className='row'>
        			<div className='col-sm-1.3' style={{display:'flex', padding:'1em'}}>
        				
        				<div id='container' style={{position:'relative'}}>
        						<img id="user-profile-image" src={this.getUserImage()} style={{width: '208px', border: '3px solid',
        																					   backgroundColor: 'white'}}/>
        				</div>
        				
        			</div>



        			
        			<div className='col-sm-4'>
        				<div style={{color: 'white', fontSize:'40px', 
        										marginTop: '20px'}}>
        										{testUser.name}'s Profile
        				</div>
        				<textarea readonly rows='5' cols='35' value={testUser.biography} style={{resize: 'none', border: '3px solid'}}/>
        			</div>
        		</div>
        		<div className='row' style={{padding:'1em'}}>
        			<div style={{color: 'white', fontSize:'35px', 
        										marginTop: '20px'}}>
        										{testUser.name}'s Liked Songs
        			</div>
        			
        		</div>
        		<div className='row' style={{padding:'1em'}}>
        			<div className='card-deck'>
        				<div className='card'>
        					<img className="card-img-top song-entry-profile" src={icon_song}/>
        					<div className="card-body card-entry-profile" style={{textAlign:'center',}}>
						      <h1 className="card-title card-song-name">{testUser.likedSongs[0].title}</h1>
                              <p className="card-text">{testUser.likedSongs[0].artist}</p>
                              <p className="card-text">{testUser.likedSongs[0].likes} <img src={icon_like} className='small-icon-profile'/></p>
						    </div>
        				</div>
        				<div className='card'>
        					<img className="card-img-top song-entry-profile" src={icon_song}/>
        					<div className="card-body card-entry-profile" style={{textAlign:'center',}}>
                              <h1 className="card-song-name">{testUser.likedSongs[1].title}</h1>
                              <p className="card-text">{testUser.likedSongs[1].artist}</p>
                              <p className="card-text">{testUser.likedSongs[1].likes} <img src={icon_like} className='small-icon-profile'/></p>
                            </div>
        				</div>
        				<div className='card'>
        					<img className="card-img-top song-entry-profile" src={icon_song}/>
        					<div className="card-body card-entry-profile" style={{textAlign:'center',}}>
                              <h1 className="card-title card-song-name">{testUser.likedSongs[2].title}</h1>
                              <p className="card-text">{testUser.likedSongs[2].artist}</p>
                              <p className="card-text">{testUser.likedSongs[2].likes} <img src={icon_like} className='small-icon-profile'/></p>
                            </div>
        				</div>
                        
        			</div>
        		</div>
                <div className='row' style={{padding:'1em'}}>
                    <div style={{color: 'white', fontSize:'35px', 
                                                marginTop: '20px'}}>
                                                {testUser.name}'s Playlists
                    </div>
                    
                </div>
                <div className='row' style={{padding:'1em'}}>
                    <div className='card-deck'>
                        <div className='card'>
                            <img className="card-img-top song-entry-profile" src={icon_album}/>
                            <div className="card-body card-entry-profile" style={{textAlign:'center',}}>
                              <h1 className="card-title card-song-name">{testUser.playlists[0].name}</h1>
                              <p className="card-text card-song-name">{testUser.playlists[0].description}</p>
                              <p className="card-text">{testUser.playlists[0].likes} <img src={icon_like} className='small-icon-profile'/></p>
                            </div>
                        </div>
                        <div className='card'>
                            <img className="card-img-top song-entry-profile" src={icon_album}/>
                            <div className="card-body card-entry-profile" style={{textAlign:'center',}}>
                              <h1 className="card-title card-song-name">{testUser.playlists[1].name}</h1>
                              <p className="card-text card-song-name">{testUser.playlists[1].description}</p>
                              <p className="card-text">{testUser.playlists[1].likes} <img src={icon_like} className='small-icon-profile'/></p>
                            </div>
                        </div>
                        
                        
                    </div>
                </div>
                
        		
	        </div>
        );
    }
}
//<img id="user-profile-image" src={icon_song} className='song-entry-profile'/>
export default ProfileScreen;