import React from 'react';
import Spinner from './Spinner';
import { icon_profile_image, icon_like, icon_music_1, plus_button, icon_play_white_1, menu_button_white, icon_sound_mixer_1, icon_list, icon_playlist_2 } from '../graphics';
import { Modal, Image, Card, Button, Dropdown, DropdownButton, ButtonGroup } from 'react-bootstrap'
import DropdownItem from 'react-bootstrap/esm/DropdownItem'

const _ = require('lodash')

class ProfileScreen extends React.Component{

	constructor(props){
		super(props)
		this.newCollectionNameMaxLength = 50
		this.state = {
			user: this.props.user,
			loading: true,
			sessions_loading: true,
			playlists_loading: true,
			likedSongs_loading: true,
			likedCollections_loading: true,
			profileUser: null,
			sessions: [],
			playlists: [],
			likedSongs: [],
			likedCollections: [],
			currentSongTarget: "",
			newCollectionName: "",
			showDropdown: false,
			showCreateCollectionModal: false
		}
	}

	componentDidUpdate = (prevProps, prevState) => {
		if (prevState.user !== this.props.user) {
			this.setState({
				user: this.props.user
			})

			if (this.state.profileUser._id === this.state.user._id) { //Refresh if user is viewing own profile
				this.fetchUser().then(() => {
					this.fetchUserData()
				})
			}
		}
	}

	componentDidMount = () => {
		this.fetchUser().then(() => {
			this.fetchUserData()
		})
	}

	formatCount = (count) => {
		if (count < 1000) {
			return count
		}
		else if (count < 1000000) {
			return Math.floor(count/1000) + "k"
		}
		else {
			return Math.floor(count/1000000) + "m"
		}
	}

	handleGoToCollection = (id, e) => {
		this.props.history.push('/main/collection/' + id)
	}

	handlePlayItem = (id, e) => {
        this.props.playVideo(id)
    }

	handleCreateCollection = () => {
		if (this.handleValidateNewCollectionName()){
			this.props.axiosWrapper.axiosPost('/api/createCollection/' + this.state.newCollectionName, {}, (function(res, data){
				if (data.success) {
					this.props.handleUpdateUser(data.data.user)
					this.handleGoToCollection(data.data.collectionId)
				}
			}).bind(this), true)
		}
	}

	handleAddSongToFavorites = (songId, e) => {
        this.props.axiosWrapper.axiosPost('/api/addSongToFavorites/' + songId, {}, (function(res, data) {
            if (data.success) {
                this.props.handleUpdateUser(data.data.user)
            }
        }).bind(this), true)
	}
	
	handleRemoveSongFromFavorites = (songId, e) => {
		this.props.axiosWrapper.axiosPost('/api/removeSongFromFavorites/' + songId, {}, (function(res, data) {
			if (data.success) {
				this.props.handleUpdateUser(data.data.user)
			}
		}).bind(this), true)
	}

    handleAddSongToCollection = (songId, collectionId, e) => {
        this.props.axiosWrapper.axiosPost('/api/addSongToCollection/' + songId + '&' + collectionId, {}, (function(res, data) {
            if (data.success) {
                this.props.handleUpdateUser(data.data.user)
            }
        }).bind(this), true)
	}

	handleValidateNewCollectionName = () => {
        var length = this.state.newCollectionName.length

        if (length > 0 && length <= this.newCollectionNameMaxLength) {
            return true
        }
        return false
    }

	handleNewCollectionNameChange = (e) => {
		this.setState({
			newCollectionName: e.target.value
		})
	}

	handleMouseEnterDropdown = () => {
        this.setState({
            showDropdown: true
        })
    }

    handleMouseLeaveDropdown = () => {
        this.setState({
            showDropdown: false
        })
    }

	handleShowCreateCollectionModal = () => {
		this.setState({
			showCreateCollectionModal: true
		})
	}

	handleHideCreateCollectionModal = () => {
		this.setState({
			newCollectionName: "",
			showCreateCollectionModal: false
		})
	}

	getCharLengthClass = () => {
        return this.state.newCollectionName.length === 0 || this.handleValidateNewCollectionName() ? "color-accented body-text" : "color-alert body-text"
    }

	fetchUser () {
		if (this.props.match.params.userId === this.state.user._id) {
			return new Promise((resolve) => {
				this.setState({
					profileUser: _.cloneDeep(this.state.user),
					loading: false
				})
				resolve()
			})
		}
		else {
			return this.props.axiosWrapper.axiosGet('/api/profile/' + this.props.match.params.userId, (function(res, data) {
				if (data.success) {
					this.setState({
						profileUser: data.data.user,
						loading: false
					})
				}
			}).bind(this), true)
		}
	}

	fetchUserData = () => {
		if (this.state.profileUser && this.state.profileUser.sessions.length > 0) {
			this.props.axiosWrapper.axiosGet('/api/profile/' + this.props.match.params.userId + '/sessions', (function(res, data) {
				if (data.success) {
					this.setState({
						sessions: data.data.sessions,
						sessions_loading: false
					})
				}
			}).bind(this), true)
		}

		if (this.state.profileUser && this.state.profileUser.playlists.length > 0) {
			this.props.axiosWrapper.axiosGet('/api/profile/' + this.props.match.params.userId + '/playlists', (function(res, data) {
				if (data.success) {
					this.setState({
						playlists: data.data.playlists,
						playlists_loading: false
					})
				}
			}).bind(this), true)
		}

		if (this.state.profileUser && this.state.profileUser.likedSongs.length > 0) {
			Promise.all(this.state.profileUser.likedSongs.map((songId) => {
				return this.props.fetchVideoById(songId, true)
			})).then((likedSongs) => {
				this.setState({
					likedSongs: likedSongs,
					likedSongs_loading: false
				})
			})
		}

		if (this.state.profileUser && this.state.profileUser.likedCollections.length > 0) {
			this.props.axiosWrapper.axiosGet('/api/profile/' + this.props.match.params.userId + '/likedCollections', (function(res, data) {
				if (data.success) {
					this.setState({
						likedCollections: data.data.likedCollections,
						likedCollections_loading: false
					})
				}
			}).bind(this), true)
		}
	}

    render(){
		if (this.state.loading) {
			return <Spinner/>
		}
		else {
			return(
				<div style={{fontFamily: 'BalsamiqSans', padding:'1em'}}>
					<Modal contentClassName="profile-screen-modal" show={this.state.showCreateCollectionModal}>
							<Modal.Header onHide={this.handleHideCreateCollectionModal} closeButton>
								<Modal.Title className="title color-accented">Create A New Playlist</Modal.Title>
							</Modal.Header>
							<Modal.Body>
								<p className="subtitle color-accented">Playlist Name:</p>
								<input className="body-text" value={this.state.newCollectionName} onChange={this.handleNewCollectionNameChange}></input>
								<div className={this.getCharLengthClass()}>{this.state.newCollectionName.length}/{this.newCollectionNameMaxLength}</div>
							</Modal.Body>
							<Modal.Footer>
								<Button className="body-text bg-color-harmony color-accented" onClick={this.handleCreateCollection} disabled={!this.handleValidateNewCollectionName()}>Create</Button>
							</Modal.Footer>
					</Modal>
					<div id='profile-screen-top-container' className='row'>
						<div className='col-sm-1.3' style={{display:'flex', padding:'1em'}}>
							<div id='container' style={{position:'relative'}}>
									<img id="user-profile-image" src={this.state.profileUser.image ? this.state.profileUser.image : icon_profile_image} style={{width: '208px'}}/>
							</div>
						</div>
						<div className='col'>
							<div className='body-text color-contrasted'>PROFILE</div>
							<div id='profile-screen-username' className='color-contrasted'>
								{this.state.profileUser.username}
							</div>
							<div id='profile-screen-biography' className='body-text color-contrasted' rows='5' cols='35'>{this.state.profileUser.biography}</div>
							<div id='profile-screen-summary' className='row'>
								<div id='profile-screen-summary-text' className='body-text color-contrasted'>
									{this.state.profileUser.sessions.length} Session(s) ⋅  
									{" " + this.state.profileUser.playlists.length} Playlist(s) ⋅  
									{" " + this.state.profileUser.likedSongs.length} Liked Song(s) ⋅  
									{" " + this.state.profileUser.likedCollections.length} Liked Collection(s)
								</div>
							</div>
						</div>
					</div>
					<div id='profile-screen-bottom-container'>
					{ this.state.profileUser.sessions !== undefined && this.state.profileUser.sessions.length > 0 ?
							<div>	
								<div className='row' style={{padding:'1em'}}>
									<div style={{color: 'white', fontSize:'35px'}}>
										{this.state.profileUser.username}'s Sessions
									</div>
								</div>
								<div className='row' style={{padding:'1em'}}>
									<div className='card-deck profile-screen-category-container'>
										{
											this.state.sessions_loading ? 
											<Spinner/> :
											this.state.sessions.map((session, session_ind) => 
												<div key={session_ind} className='card profile-screen-category-item-card'>
													<img className="card-img-top profile-screen-category-item-card-image" src={session.image}/>
													<div className="card-body profile-screen-category-item-card-text-container" style={{textAlign:'center'}}>
														<h1 className="card-title profile-screen-category-item-card-name title">{session.name}</h1>
														<p className="body-text profile-screen-category-item-card-creator body-text">{session.hostName}</p>
														<div className="profile-screen-category-item-card-likes">{this.formatCount(session.likes)} <img src={icon_like} className='profile-screen-category-item-card-likes-icon'/></div>
														<div className="profile-screen-category-item-card-streams">{session.streams} <img src={session.image ? session.image : icon_sound_mixer_1} className='profile-screen-category-item-card-streams-icon'/></div>
													</div>
												</div>
												)
										}
									</div>
								</div>
							</div> :
							<div></div>
					}
					<div>	
						<div className='row' style={{padding:'1em'}}>
							<div style={{color: 'white', fontSize:'35px'}}>
								{this.state.profileUser.username}'s Playlists
							</div>
						</div>
						<div className='row' style={{padding:'1em'}}>
							<div className='card-deck profile-screen-category-container'>
								{
									this.state.playlists_loading ?
									<Spinner/> :
									this.state.playlists.map((playlist, playlist_ind) => 
										<div className='card profile-screen-category-item-card' key={playlist_ind} onClick={this.handleGoToCollection.bind(this, playlist._id)}>
											<img className="card-img-top profile-screen-category-item-card-image" src={playlist.image ? playlist.image : icon_playlist_2}/>
											<div className="card-body profile-screen-category-item-card-text-container" style={{textAlign:'center'}}>
												<h1 className="card-title profile-screen-category-item-card-name title">{playlist.name}</h1>
												<p className="profile-screen-category-item-card-creator body-text">{playlist.user}</p>
												<p className="profile-screen-category-item-card-likes">{this.formatCount(playlist.likes)} <img src={icon_like} className='profile-screen-category-item-card-likes-icon'/></p>
											</div>
										</div>
										)
								}
								{
									this.state.user._id === this.state.profileUser._id ? //Viewing own profile
									<div className='card profile-screen-create-collection-card' onClick={this.handleShowCreateCollectionModal}>
										<img className="profile-screen-create-collection-card-img" src={plus_button}/>
									</div> :
									<div></div>
								}
							</div>
						</div>
					</div>
						{ this.state.profileUser.likedSongs !== undefined && this.state.profileUser.likedSongs.length > 0 ?
							<div>
								<div className='row' style={{padding:'1em'}}>
									<div style={{color: 'white', fontSize:'35px'}}>
										{this.state.profileUser.username}'s Liked Songs
									</div>
								</div>
								<div className='row' style={{padding:'1em'}}>
									<div className='card-deck profile-screen-category-container'>
										{
											this.state.likedSongs_loading ? 
											<Spinner/> :
											this.state.likedSongs.map((song, song_ind) => 
												<div key={song_ind} className='card profile-screen-category-item-card'>
													<div className="profile-screen-category-item-card-image-overlay-trigger">
                                                        <div className="profile-screen-category-item-card-image-overlay-container">
                                                            <Dropdown className="profile-screen-category-item-card-image-overlay-dropdown" as={ButtonGroup}>
                                                                <Dropdown.Toggle split className="profile-screen-category-item-card-image-overlay-dropdown-button no-caret">
                                                                    <Image className="profile-screen-category-item-card-image-overlay-dropdown-button-icon" src={menu_button_white} />
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu className="profile-screen-category-item-card-image-overlay-dropdown-menu">
                                                                    <Dropdown.Item>
                                                                        <Button onClick={this.props.queue.addSongToFutureQueue.bind(this, song)}>
                                                                            Add To Queue
                                                                        </Button>
                                                                    </Dropdown.Item>
                                                                    {
                                                                        this.props.auth ?
                                                                        <div>
                                                                            <DropdownItem onMouseEnter={this.handleMouseEnterDropdown} onMouseLeave={this.handleMouseLeaveDropdown}>
                                                                                <DropdownButton
                                                                                    as={ButtonGroup}
                                                                                    key="right"
                                                                                    className="profile-screen-category-item-card-image-overlay-dropdown-menu-collection"
                                                                                    drop="right"
                                                                                    variant="secondary"
                                                                                    title="Add To Playlist"
                                                                                    show={this.state.showDropdown}
                                                                                >
                                                                                    {
                                                                                        this.state.playlists.map((playlist, playlist_ind) => 
                                                                                            <Dropdown.Item key={playlist_ind} onClick={this.handleAddSongToCollection.bind(this, song.id, playlist._id)}>{playlist.name}</Dropdown.Item>
                                                                                        )
                                                                                    }
                                                                                    {
                                                                                        this.state.playlists.length > 0 ?
                                                                                        <Dropdown.Divider /> :
                                                                                        <div></div>
                                                                                    }
                                                                                    <Dropdown.Item onClick={this.handleShowCreateCollectionModal.bind(this, song.id)}>Create Playlist</Dropdown.Item>
                                                                                </DropdownButton>
                                                                            </DropdownItem>
                                                                            {
                                                                                !this.state.user.likedSongs.includes(song.id) ? 
                                                                                <Dropdown.Item>
                                                                                    <Button onClick={this.handleAddSongToFavorites.bind(this, song.id)}>
                                                                                        Save To Favorites
                                                                                    </Button>
                                                                                </Dropdown.Item> :
                                                                                <Dropdown.Item>
																					<Button onClick={this.handleRemoveSongFromFavorites.bind(this, song.id)}>
																						Remove From Favorites
																					</Button>
																				</Dropdown.Item>
                                                                            }
                                                                        </div>
                                                                        : <div></div>
                                                                    }
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                            <Button className="profile-screen-category-item-card-image-overlay-play-button" onClick={this.handlePlayItem.bind(this, song.id)}>
                                                                <Image className="profile-screen-category-item-card-image-overlay-play-button-icon" src={icon_play_white_1} roundedCircle/>
                                                            </Button>
                                                        </div>
                                                        <Card.Img className="profile-screen-category-item-card-image" src={song.image_high ? song.image_high : song.image_med ? song.image_med : song.image_std ? song.image_std : song.image ? song.image : icon_music_1} />
                                                    </div>
													<div className="card-body profile-screen-category-item-card-text-container" style={{textAlign:'center'}}>
														<h1 className="card-title profile-screen-category-item-card-name title">{song.name}</h1>
														<p className="profile-screen-category-item-card-creator body-text">{song.creator}</p>
														<p className="profile-screen-category-item-card-likes">{this.formatCount(song.likes)} <img src={icon_like} className='profile-screen-category-item-card-likes-icon'/></p>
													</div>
												</div>
												)
										}
									</div>
								</div>
							</div> : 
							<div></div>
						}
						{ this.state.profileUser.likedCollections !== undefined && this.state.profileUser.likedCollections.length > 0 ?
							<div>
								<div className='row' style={{padding:'1em'}}>
									<div style={{color: 'white', fontSize:'35px'}}>
										{this.state.profileUser.username}'s Liked Collections
									</div>
								</div>
								<div className='row' style={{padding:'1em'}}>
									<div className='card-deck profile-screen-category-container'>
										{
											this.state.likedCollections_loading ? 
											<Spinner/> :
											this.state.likedCollections.map((collection, collection_ind) => 
												<div key={collection_ind} className='card profile-screen-category-item-card'>
													<img className="card-img-top profile-screen-category-item-card-image" src={collection.image ? collection.image : icon_list}/>
													<div className="card-body profile-screen-category-item-card-text-container" style={{textAlign:'center'}}>
														<h1 className="card-title profile-screen-category-item-card-name title">{collection.name}</h1>
														<p className="profile-screen-category-item-card-creator body-text">{collection.user}</p>
														<p className="profile-screen-category-item-card-likes">{this.formatCount(collection.likes)} <img src={icon_like} className='profile-screen-category-item-card-likes-icon'/></p>
													</div>
												</div>
												)
										}
									</div>
								</div>
							</div> 
							: <div></div>
							
						}
                    		
					</div>

				</div>
			);
		}
	}
}
export default ProfileScreen;