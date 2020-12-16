import React from 'react';
import Spinner from './Spinner';
import { yin_yang_fill_color_harmony , icon_like, icon_music_1, plus_button, icon_play_white_1, menu_button_white, icon_sound_mixer_1, icon_list, icon_playlist_2 } from '../graphics';
import { Modal, Image, Card, Button, Dropdown, DropdownButton, ButtonGroup } from 'react-bootstrap'
import DropdownItem from 'react-bootstrap/esm/DropdownItem'
import { mainScreens } from '../const'

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
			userId: null,
			profileUser: null,
			sessions: [],
			playlists: [],
			likedSongs: [],
			likedCollections: [],
			currentSongTarget: "",
			newCollectionName: "",
			showDropdown: false,
			showCreateCollectionModal: false,
			profileImageSrc: null,
			error: false,
		}
	}

	componentDidUpdate = (prevProps, prevState) => {
		if (!_.isEqual(prevState.user, this.props.user)) {
			this.setState({
				user: this.props.user
			}, () => {
				//Screen is active, user is viewing own profile, and changes are made
				if (this.props.visible && this.state.profileUser._id === this.state.user._id) { 
					this.setState({
						userId: this.state.profileUser._id,
						loading: true,
						sessions_loading: true,
						playlists_loading: true,
						likedSongs_loading: true,
						likedCollections_loading: true,
						error: false,
					}, this.fetchUser)
				}
			})
		}

		//If screen is now active
        if (!prevProps.visible && this.props.visible) {
			this.setState({
				userId: this.props.screenProps.userId,
				loading: true,
				sessions_loading: true,
				playlists_loading: true,
				likedSongs_loading: true,
				likedCollections_loading: true,
				error: false
			}, this.fetchUser)
		}
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
		this.props.switchScreen(mainScreens.COLLECTION, id)
	}

	handleGoToItem = (obj, e) => {
        if (obj.type === "session") {
			this.props.switchScreen(mainScreens.SESSION, obj._id)
        }
        else if (obj.type === "collection") {
			this.props.switchScreen(mainScreens.COLLECTION, obj._id)
        }
	}
	
	handleGoToCreator = (obj, e) => {
		if (obj.type === "collection") {
			this.props.switchScreen(mainScreens.PROFILE, obj.ownerId)
        }
    }

	handlePlayItem = (obj, e) => {
		var data
        if (obj.type === "song") {
			
			if (this.props.shouldStartSession()) {
				this.handleCreateSession()
			} 
			else if (this.props.shouldEmitActions()) {
                data = {
                    subaction: "play_song",
                    songId: obj._id
                }
                this.props.sessionClient.emitQueue(this.state.username, this.state.user._id, data)
			}
			this.props.playVideo(obj._id)
        }
        else if (obj.type === "session") {
			this.props.switchScreen(mainScreens.SESSION, obj._id)
        }
        else if (obj.type === "collection") {
			var songList = _.cloneDeep(obj.songList)
            if (songList.length > 0) {
				var songId = songList.shift()
				if (this.props.shouldEmitActions()) {
                    data = {
                        subaction: "play_song",
                        songId: songId
                    }
                    this.props.sessionClient.emitQueue(this.state.username, this.state.user._id, data)
				}
				this.props.playVideo(songId)

				Promise.all(songList.map((songId) => {
					return this.props.fetchVideoById(songId, true)
				})).then((songs) => {
					songs.forEach(song => this.handleAddSongToFutureQueue(song))
				}).then(() => {
					if (this.props.shouldStartSession()) {
                        this.handleCreateSession()
                    }
				})
            }
        }
	}
	
	handleCreateSession = () => {
        this.props.axiosWrapper.axiosPost('/api/session/newSession', {
            name: `${this.props.user.username}'s Live Session`
        }, (function(res, data) {
			if (data.success) {
				this.props.handleUpdateUser(data.data.user)
				this.props.switchScreen(mainScreens.SESSION, data.data.sessionId)
			}
		}).bind(this), true)
    }

	handleCreateCollection = () => {
		if (this.handleValidateNewCollectionName()){
			this.props.axiosWrapper.axiosPost('/api/createCollection/' + this.state.newCollectionName, {}, (function(res, data){
				if (data.success) {
					this.props.handleUpdateUser(data.data.user)
					this.handleHideCreateCollectionModal()
					this.handleGoToCollection(data.data.collectionId)
				}
			}).bind(this), true)
		}
	}

	handleAddCollectionToFutureQueue = (collection, e) => {
        Promise.all(collection.songList.map((songId) => {
            return this.props.fetchVideoById(songId, true)
        })).then((songs) => {
            songs.forEach(song => this.handleAddSongToFutureQueue(song))
        })
	}
	
	handleDeleteCollection = (collectionId, e) => {
		this.props.axiosWrapper.axiosGet('/api/collection/delete/' + collectionId, (function(res, data){
            if (data.success){
                this.props.handleUpdateUser(data.data.user);
            }
        }).bind(this), true)
	}

    handleAddCollectionToFavorites = (collectionId, e) => {
        this.props.axiosWrapper.axiosPost('/api/addCollectionToFavorites/' + collectionId, {}, (function(res, data) {
            if (data.success) {
                this.props.handleUpdateUser(data.data.user)
            }
        }).bind(this), true)
    }

    handleRemoveCollectionFromFavorites = (collectionId, e) => {
        this.props.axiosWrapper.axiosPost('/api/removeCollectionFromFavorites/' + collectionId, {}, (function(res, data) {
            if (data.success) {
                this.props.handleUpdateUser(data.data.user)
            }
        }).bind(this), true)
	}
	
	handleAddSongToFutureQueue = (song) => {
        if (this.props.shouldEmitActions()) {
            var data = {
                subaction: "add_song",
                song: song
            }
            this.props.sessionClient.emitQueue(this.state.username, this.state.user._id, data)
        }
        this.props.queue.addSongToFutureQueue(song)
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
		if (this.state.user && (this.state.userId === this.state.user._id)) {
			this.setState({
				profileUser: _.cloneDeep(this.state.user),
				loading: false
			}, this.fetchUserData)
		}
		else {
			this.props.axiosWrapper.axiosGet('/api/profile/' + this.state.userId, (function(res, data) {
				if (data.success) {
					this.setState({
						profileUser: data.data.user,
						loading: false
					}, this.fetchUserData)
				}
			}).bind(this), true, (function(res, data){
                console.log("erorr callback")
                    this.setState({
                        error:true,
                        loading:false
                    })
            
            }).bind(this))
		}
	}

	fetchUserData = () => {
		if (this.state.profileUser) {
			if (this.state.profileUser.image && this.state.profileUser.image.data){
				this.setState({profileImageSrc: this.setImage(this.state.profileUser.image)});
			}
			if (this.state.profileUser.sessions.length > 0) {
				this.props.axiosWrapper.axiosGet('/api/profile/' + this.state.profileUser._id + '/sessions', (function(res, data) {
					if (data.success) {
						this.setState({
							sessions: data.data.sessions,
							sessions_loading: false
						})
					}
				}).bind(this), true)
			}
			else if (this.state.sessions_loading) {
				this.setState({
					sessions: [],
					sessions_loading: false
				})
			}

			if (this.state.profileUser.playlists.length > 0) {
				this.props.axiosWrapper.axiosGet('/api/profile/' + this.state.profileUser._id + '/playlists', (function(res, data) {
					if (data.success) {
						this.setState({
							playlists: data.data.playlists,
							playlists_loading: false
						})
					}
				}).bind(this), true)
			}
			else if (this.state.playlists_loading) {
				this.setState({
					playlists: [],
					playlists_loading: false
				})
			}

			if (this.state.profileUser.likedSongs.length > 0) {
				Promise.all(this.state.profileUser.likedSongs.map((songId) => {
					return this.props.fetchVideoById(songId, true)
				})).then((likedSongs) => {
					this.setState({
						likedSongs: likedSongs,
						likedSongs_loading: false
					})
				})
			}
			else if (this.state.likedSongs_loading) {
				this.setState({
					likedSongs: [],
					likedSongs_loading: false
				})
			}

			if (this.state.profileUser.likedCollections.length > 0) {
				this.props.axiosWrapper.axiosGet('/api/profile/' + this.state.profileUser._id + '/likedCollections', (function(res, data) {
					if (data.success) {
						this.setState({
							likedCollections: data.data.likedCollections,
							likedCollections_loading: false
						})
					}
				}).bind(this), true)
			}
			else if (this.state.likedCollections_loading) {
				this.setState({
					likedCollections: [],
					likedCollections_loading: false
				})
			}
		}
	}

	setImage = (image) => {
		return 'data:' + image.contentType + ';base64,' + btoa(image.data);
	}

    render(){
		var component
		if (this.state.loading) {
			component = <Spinner/>
		}
		else if(this.state.error && !this.state.loading){
            component = <div className="color-accented body-text error-404-display">Oops, profile not found</div>
        }
		else {
			component = (
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
					<div id='profile-screen-top-container' className='row' style={{minHeight: '12vw', maxHeight: '15vw'}}>
						<div className='col-sm-1.3' style={{display:'flex', padding:'1em', maxWidth: '20vw'}}>
							<div id='container' style={{position:'relative'}}>
									<img id="user-profile-image" src={this.state.profileUser.image && this.state.profileUser.image.data ? this.state.profileImageSrc : yin_yang_fill_color_harmony } style={{width: '208px'}} alt=""/>
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
									{this.state.sessions.length} Session(s) ⋅  
									{" " + this.state.playlists.length} Playlist(s) ⋅  
									{" " + this.state.likedSongs.length} Liked Song(s) ⋅  
									{" " + this.state.likedCollections.length} Liked Collection(s)
								</div>
							</div>
						</div>
					</div>
					<div id='profile-screen-bottom-container'>
					{
						
						[this.state.profileUser.sessions,
						this.state.profileUser.playlists,
						this.state.profileUser.likedSongs,
						this.state.profileUser.likedCollections
						].every(arr => arr.length === 0) ?

						<div className="profile-screen-empty-notice-container">
						{
							this.state.user && (this.state.user._id === this.state.profileUser._id) ?
							<div className="profile-screen-empty-notice-container-box">
								<div className="profile-screen-empty-notice subtitle color-accented">
									Your profile seems to be empty.
								</div>
								<div className="profile-screen-empty-notice-create-collection-button-container">
									<Button className="profile-screen-empty-notice-create-collection-button bg-color-harmony" onClick={this.handleShowCreateCollectionModal}>
										<div className="subtitle color-accented">
											Create A Playlist
										</div>
									</Button>
								</div>
							</div> :
							<div className="profile-screen-empty-notice subtitle color-accented">
								Looks like {this.state.profileUser.username} has not customized their profile yet.<br/>
							</div>
						} 
						</div> :
						<div>
						{ 
							this.state.profileUser.sessions && (this.state.profileUser.sessions.length > 0) ?
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
											<div></div> :
											this.state.sessions.map((session, session_ind) => 
												<div key={session_ind} className='card profile-screen-category-item-card'>
													<img className="card-img-top profile-screen-category-item-card-image" src={session.image} alt=""/>
													<div className="card-body profile-screen-category-item-card-text-container" style={{textAlign:'center'}}>
														<h1 className="card-title profile-screen-category-item-card-name ellipsis-multi-line-overflow subtitle color-jet" onClick={this.handleGoToItem.bind(this, session)}>{session.name}</h1>
														<p className="body-text profile-screen-category-item-card-creator ellipsis-multi-line-overflow body-text color-jet">{session.hostName}</p>
														<div className="profile-screen-category-item-card-likes">{this.formatCount(session.likes)} <img src={icon_like} className='profile-screen-category-item-card-likes-icon' alt=""/></div>
														<div className="profile-screen-category-item-card-streams">{session.streams} <img src={session.image ? session.image : icon_sound_mixer_1} className='profile-screen-category-item-card-streams-icon' alt=""/></div>
													</div>
												</div>
												)
										}
									</div>
								</div>
							</div> :
							<div></div>
						}
						{
							this.state.profileUser.playlists && (this.state.profileUser.playlists.length > 0 || (this.state.profileUser._id === this.state.user._id)) ?
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
											<div></div> :
											this.state.playlists.map((playlist, playlist_ind) => 
												<div key={playlist_ind} className='card profile-screen-category-item-card'>
													<div className="profile-screen-category-item-card-image-overlay-trigger">
														<div className="profile-screen-category-item-card-image-overlay-container">
															<Dropdown className="profile-screen-category-item-card-image-overlay-dropdown" as={ButtonGroup}>
																<Dropdown.Toggle split className="profile-screen-category-item-card-image-overlay-dropdown-button no-caret">
																	<Image className="profile-screen-category-item-card-image-overlay-dropdown-button-icon" src={menu_button_white} />
																</Dropdown.Toggle>
																<Dropdown.Menu className="profile-screen-category-item-card-image-overlay-dropdown-menu">
																	<Dropdown.Item>
																		<Button onClick={this.handleAddCollectionToFutureQueue.bind(this, playlist)} disabled={this.props.shouldReceiveActions()}>
																			Add To Queue
																		</Button>
																	</Dropdown.Item>
																	{
																		this.props.auth ?
																		<div>
																			{
																				this.state.user && !this.state.user.likedCollections.includes(playlist._id) ? 
																				<Dropdown.Item>
																					<Button onClick={this.handleAddCollectionToFavorites.bind(this, playlist._id)}>
																						Save To Favorites
																					</Button>
																				</Dropdown.Item> :
																				<Dropdown.Item>
																					<Button onClick={this.handleRemoveCollectionFromFavorites.bind(this, playlist._id)}>
																						Remove From Favorites
																					</Button>
																				</Dropdown.Item>
																			}
																			{this.state.user && this.state.user._id === this.state.profileUser._id ?
																				<Dropdown.Item>
																					<Button onClick={this.handleDeleteCollection.bind(this, playlist._id)}>
																						Delete Collection
																					</Button>
																				</Dropdown.Item> : <div></div>
																			}
																		</div>
																		: <div></div>
																	}
																</Dropdown.Menu>
															</Dropdown>
															<Button className="profile-screen-category-item-card-image-overlay-play-button" onClick={this.handlePlayItem.bind(this, playlist)}>
																<Image className="profile-screen-category-item-card-image-overlay-play-button-icon" src={icon_play_white_1} roundedCircle/>
															</Button>
														</div>
														<Card.Img className="profile-screen-category-item-card-image" src={playlist.image && playlist.image.data ? this.setImage(playlist.image) : icon_playlist_2} />
													</div>
													<div className="card-body profile-screen-category-item-card-text-container" style={{textAlign:'center'}}>
														<h1 className="card-title profile-screen-category-item-card-name ellipsis-multi-line-overflow subtitle color-jet" onClick={this.handleGoToItem.bind(this, playlist)}>{playlist.name}</h1>
														<p className="profile-screen-category-item-card-creator ellipsis-multi-line-overflow body-text color-jet">{playlist.ownerName}</p>
														<p className="profile-screen-category-item-card-likes">{this.formatCount(playlist.likes)} <img src={icon_like} className='profile-screen-category-item-card-likes-icon' alt=""/></p>
													</div>
												</div>
											)
										}
										{
											this.state.user && (this.state.user._id === this.state.profileUser._id) ? //Viewing own profile
											<div className='card profile-screen-create-collection-card' onClick={this.handleShowCreateCollectionModal}>
												<img className="profile-screen-create-collection-card-img" src={plus_button} alt=""/>
											</div> :
											<div></div>
										}
									</div>
								</div>
							</div> :
							<div></div>
						}
						{ 
							this.state.profileUser.likedSongs && (this.state.profileUser.likedSongs.length > 0) ?
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
											<div></div> :
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
																		<Button onClick={this.handleAddSongToFutureQueue.bind(this, song)} disabled={this.props.shouldReceiveActions()}>
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
																							<Dropdown.Item key={playlist_ind} onClick={this.handleAddSongToCollection.bind(this, song._id, playlist._id)}>{playlist.name}</Dropdown.Item>
																						)
																					}
																					{
																						this.state.playlists.length > 0 ?
																						<Dropdown.Divider /> :
																						<div></div>
																					}
																					<Dropdown.Item onClick={this.handleShowCreateCollectionModal.bind(this, song._id)}>Create Playlist</Dropdown.Item>
																				</DropdownButton>
																			</DropdownItem>
																			{
																				this.state.user && !this.state.user.likedSongs.includes(song._id) ? 
																				<Dropdown.Item>
																					<Button onClick={this.handleAddSongToFavorites.bind(this, song._id)}>
																						Save To Favorites
																					</Button>
																				</Dropdown.Item> :
																				<Dropdown.Item>
																					<Button onClick={this.handleRemoveSongFromFavorites.bind(this, song._id)}>
																						Remove From Favorites
																					</Button>
																				</Dropdown.Item>
																			}
																		</div>
																		: <div></div>
																	}
																</Dropdown.Menu>
															</Dropdown>
															<Button className="profile-screen-category-item-card-image-overlay-play-button" onClick={this.handlePlayItem.bind(this, song)}>
																<Image className="profile-screen-category-item-card-image-overlay-play-button-icon" src={icon_play_white_1} roundedCircle/>
															</Button>
														</div>
														<Card.Img className="profile-screen-category-item-card-image" src={song.image_high ? song.image_high : song.image_med ? song.image_med : song.image_std ? song.image_std : song.image ? song.image : icon_music_1} />
													</div>
													<div className="card-body profile-screen-category-item-card-text-container" style={{textAlign:'center'}}>
														<h1 className="card-title profile-screen-category-item-card-name ellipsis-multi-line-overflow subtitle color-jet">{song.name}</h1>
														<p className="profile-screen-category-item-card-creator ellipsis-multi-line-overflow body-text color-jet">{song.creator}</p>
														<p className="profile-screen-category-item-card-likes">{this.formatCount(song.likes)} <img src={icon_like} className='profile-screen-category-item-card-likes-icon' alt=""/></p>
													</div>
												</div>
											)
										}
									</div>
								</div>
							</div> : 
							<div></div>
						}
						{ 
							this.state.profileUser.likedCollections && (this.state.likedCollections.length > 0) ?
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
											<div></div> :
											this.state.likedCollections.map((collection, collection_ind) => 
												<div key={collection_ind} className='card profile-screen-category-item-card'>
													<div className="profile-screen-category-item-card-image-overlay-trigger">
														<div className="profile-screen-category-item-card-image-overlay-container">
															<Dropdown className="profile-screen-category-item-card-image-overlay-dropdown" as={ButtonGroup}>
																<Dropdown.Toggle split className="profile-screen-category-item-card-image-overlay-dropdown-button no-caret">
																	<Image className="profile-screen-category-item-card-image-overlay-dropdown-button-icon" src={menu_button_white} />
																</Dropdown.Toggle>
																<Dropdown.Menu className="profile-screen-category-item-card-image-overlay-dropdown-menu">
																	<Dropdown.Item>
																		<Button onClick={this.handleAddCollectionToFutureQueue.bind(this, collection)} disabled={this.props.shouldReceiveActions()}>
																			Add To Queue
																		</Button>
																	</Dropdown.Item>
																	{
																		this.props.auth ?
																		<div>
																			{
																				this.state.user && !this.state.user.likedCollections.includes(collection._id) ? 
																				<Dropdown.Item>
																					<Button onClick={this.handleAddCollectionToFavorites.bind(this, collection._id)}>
																						Save To Favorites
																					</Button>
																				</Dropdown.Item> :
																				<Dropdown.Item>
																					<Button onClick={this.handleRemoveCollectionFromFavorites.bind(this, collection._id)}>
																						Remove From Favorites
																					</Button>
																				</Dropdown.Item>
																			}
																		</div>
																		: <div></div>
																	}
																</Dropdown.Menu>
															</Dropdown>
															<Button className="profile-screen-category-item-card-image-overlay-play-button" onClick={this.handlePlayItem.bind(this, collection)}>
																<Image className="profile-screen-category-item-card-image-overlay-play-button-icon" src={icon_play_white_1} roundedCircle/>
															</Button>
														</div>
														<Card.Img className="profile-screen-category-item-card-image" src={collection.image && collection.image.data ? this.setImage(collection.image) : icon_list} />
													</div>
													<div className="card-body profile-screen-category-item-card-text-container" style={{textAlign:'center'}}>
														<h1 className="card-title profile-screen-category-item-card-name ellipsis-multi-line-overflow subtitle color-jet" onClick={this.handleGoToItem.bind(this, collection)}>{collection.name}</h1>
														<p className="profile-screen-category-item-card-creator ellipsis-multi-line-overflow body-text color-jet" onClick={this.handleGoToCreator.bind(this, collection)}>{collection.ownerName}</p>
														<p className="profile-screen-category-item-card-likes">{this.formatCount(collection.likes)} <img src={icon_like} className='profile-screen-category-item-card-likes-icon' alt=""/></p>
													</div>
												</div>
											)
										}
									</div>
								</div>
							</div> :
							<div></div>
						}
						</div>
					}
					</div>
				</div>
			);
		}

		return(
			<div className={this.props.visible ? "visible" : "hidden"}>
                {component}
            </div>
		)
	}
}
export default ProfileScreen;