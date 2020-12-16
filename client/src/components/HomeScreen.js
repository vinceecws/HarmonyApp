import React from 'react';
import { CardDeck, Card, Image, Button, Dropdown, DropdownButton, ButtonGroup, Modal } from 'react-bootstrap';
import DropdownItem from 'react-bootstrap/esm/DropdownItem';
import { icon_music_1, icon_playlist_2, icon_profile_image, icon_play_white_1, menu_button_white } from '../graphics'
import Spinner from './Spinner';
import { mainScreens } from '../const'

const _ = require('lodash')

class HomeScreen extends React.Component {
    constructor(props){
        super(props)
        this.newCollectionNameMaxLength = 50
        this.state = {
            suggestions: [],
            playlists: [],
            user: this.props.user,
            newCollectionName: "",
            currentSongTarget: "",
            showDropdown: false,
            showCreateCollectionModal: false,
            suggestions_loading: true,
            playlists_loading: true
        }
    }

    componentDidMount = () => {
        this.topSessionsListener = this.props.sessionManager.subscribeToAction("rcvdTopSessions", this.handleSetTopSessions.bind(this))
        this.sugggestionsRefresher = setInterval(() => {
            if (!this.state.suggestions_loading) {
                this.setState({
                    suggestions_loading: true,
                }, this.fetchSuggestions)
            }
        }, 5*60*1000) //Refresh at 5-minute intervals

        if (this.state.user) {
            this.setState({
                suggestions_loading: true,
                playlists_loading: true
            }, () => {
                this.fetchPlaylists()
                this.fetchSuggestions()
            })
        }
        else {
            this.setState({
                suggestions_loading: true,
                playlists_loading: false
            }, this.fetchSuggestions)
        }
    }

    componentWillUnmount = () => {
        this.topSessionsListener = this.props.sessionManager.unsubscribeFromAction("rcvdTopSessions", this.topSessionsListener)
        clearInterval(this.sugggestionsRefresher)
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (!_.isEqual(prevState.user, this.props.user)) {
            this.setState({
                user: this.props.user,
                playlists_loading: true
            }, () => {
                if (this.state.user) {
                    this.fetchPlaylists()
                }
                else {
                    this.setState({
                        playlists_loading: false
                    })
                }
            })
        }
    }

    handleCreateCollection = () => {
		if (this.handleValidateNewCollectionName()){
			this.props.axiosWrapper.axiosPost('/api/createCollectionWithSong/' + this.state.newCollectionName + "&" + this.state.currentSongTarget, {}, (function(res, data){
				if (data.success) {
                    this.handleHideCreateCollectionModal()
                    this.props.handleUpdateUser(data.data.user)
                    this.props.switchScreen(mainScreens.COLLECTION, data.data.collectionId)
				}
			}).bind(this), true)
		}
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

    handleShowCreateCollectionModal = (songId, e) => {
		this.setState({
            currentSongTarget: songId,
			showCreateCollectionModal: true
		})
	}

	handleHideCreateCollectionModal = () => {
		this.setState({
            newCollectionName: "",
            currentSongTarget: "",
			showCreateCollectionModal: false
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

    handleAddCollectionToFutureQueue = (collection, e) => {
        Promise.all(collection.songList.map((songId) => {
            return this.props.fetchVideoById(songId, true)
        })).then((songs) => {
            songs.forEach(song => this.handleAddSongToFutureQueue(song))
        })
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

    handleSetTopSessions = (event, sessions) => {
        sessions = sessions.map(session => {
            session.type = "session"
            return session
        })

        var newSuggestions = _.cloneDeep(this.state.suggestions)
        var updatedCategory = {
            categoryName: "Live Now",
            suggestions: sessions
        }
        newSuggestions = this.setCategory(newSuggestions, updatedCategory)
        this.setState({
            suggestions: newSuggestions,
            suggestions_loading: false
        })
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

    handleGoToItem = (obj, e) => {
        if (obj.type === "session") {
            this.props.switchScreen(mainScreens.SESSION, obj._id)
        }
        else if (obj.type === "collection") {
            this.props.switchScreen(mainScreens.COLLECTION, obj._id)
        }
        else if (obj.type === "user") {
            this.props.switchScreen(mainScreens.PROFILE, obj._id)
        }
    }

    handleGoToItemCreator = (obj, e) => {
        if (obj.type === "session") {
            this.props.switchScreen(mainScreens.PROFILE, obj.hostId)
        }
        else if (obj.type === "collection") {
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

    fetchPlaylists = () => {
        this.props.axiosWrapper.axiosGet('/api/search', (function(res, data) {
            if (data.success) {
                this.setState({
                    playlists: data.data.playlists,
                    playlists_loading: false
                })
            }
        }).bind(this), true)
    }

    fetchSuggestions = () => {
        this.props.sessionManager.emitGetTopSessions()

        this.props.fetchMostPopular(15, true).then(res => {
            var newSuggestions = _.cloneDeep(this.state.suggestions)
            var updatedCategory = {
                categoryName: "Popular on YouTube",
                suggestions: res
            }
            newSuggestions = this.setCategory(newSuggestions, updatedCategory)
            this.setState({
                suggestions: newSuggestions,
                suggestions_loading: false
            })
        })

        this.props.axiosWrapper.axiosGet('/api/home', (function(res, data) {
            if (data.success) {
                var newSuggestions = _.cloneDeep(this.state.suggestions)
                data.data.suggestions.forEach(category => {
                    newSuggestions = this.setCategory(newSuggestions, category)
                })
                Promise.all(newSuggestions.map(category => {
                    return new Promise((resolve, reject) => {
                        Promise.all(category.suggestions.map(obj => {
                            if (obj.type === "song") {
                                return this.props.fetchVideoById(obj._id, true)
                            }
                            return obj
                        })).then(suggestions => {
                            resolve({
                                categoryName: category.categoryName,
                                suggestions: suggestions
                            })
                        })
                    })
                })).then(suggestions => {
                    this.setState({
                        suggestions: suggestions,
                        suggestions_loading: false
                    })
                })
            }
        }).bind(this), true)
    }

    getItemCreator = (obj) => {
        if (obj.type === "collection") {
            return obj.ownerName
        }
        else if (obj.type === "session") {
            return obj.hostName
        }
        return obj.creator
    }

    getItemName = (obj) => {
        if (obj.type === "user") {
            return obj.username
        }
        return obj.name
    }

    setImage = (image) => {
        return 'data:' + image.contentType + ';base64,' + btoa(image.data);
    }

    getItemImage = (obj) => {
        if (obj.type === "song") {
            return obj.image_high ? obj.image_high : obj.image_med ? obj.image_med : obj.image_std ? obj.image_std : obj.image ? obj.image : icon_music_1
        }
        else if (obj.type === "collection") {
            return obj.image && obj.image.data ? this.setImage(obj.image) : icon_playlist_2
        }
        else if (obj.type === "user" || obj.type === "session") {
            return obj.image && obj.image.data ? this.setImage(obj.image) : icon_profile_image
        }

        return obj.image 
    }

    getCharLengthClass = () => {
        return this.state.newCollectionName.length === 0 || this.handleValidateNewCollectionName() ? "color-accented body-text" : "color-alert body-text"
    }

    setCategory = (suggestions, updatedCategory) => {
        var wasUpdated = suggestions.some(category => {
            if (category.categoryName === updatedCategory.categoryName) {
                category.suggestions = updatedCategory.suggestions
                return true
            }
        })

        if (wasUpdated) {
            return suggestions
        }

        suggestions.push(updatedCategory)
        return suggestions
    }

    render() {
        var component
        if (!this.state.suggestions_loading && !this.state.playlists_loading) {
            component = 
                <div id="home-screen-container">
                    <Modal contentClassName="search-screen-modal" show={this.state.showCreateCollectionModal}>
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
                    {this.state.suggestions.map((category, cat_ind) => category.suggestions?.length > 0 ?
                        <div className="home-screen-category-container" key={cat_ind}>
                            <div className="home-screen-category-name title color-contrasted">{category.categoryName}</div>
                            <CardDeck className="home-screen-category-list">
                                {
                                    category.suggestions.map((obj, item_ind) => 
                                        <Card className="home-screen-category-list-item" key={item_ind}>
                                            {(obj.type === "session" || obj.type === "user") && obj.live === true ? 
                                                    <Card.Text className="home-screen-category-list-item-live-indicator tiny-text color-accented">LIVE</Card.Text> :
                                                    <div></div>
                                            }
                                            {
                                                obj.type === "song" ? 
                                                    <div className="home-screen-category-list-item-img-overlay-trigger">
                                                        <div className="home-screen-category-list-item-img-overlay-container">
                                                            <Dropdown className="home-screen-category-list-item-img-overlay-dropdown" as={ButtonGroup}>
                                                                <Dropdown.Toggle split className="home-screen-category-list-item-img-overlay-dropdown-button no-caret">
                                                                    <Image className="home-screen-category-list-item-img-overlay-dropdown-button-icon" src={menu_button_white} />
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu className="home-screen-category-list-item-img-overlay-dropdown-menu">
                                                                    <Dropdown.Item>
                                                                        <Button onClick={this.handleAddSongToFutureQueue.bind(this, obj)} disabled={this.props.shouldReceiveActions()}>
                                                                            Add To Queue
                                                                        </Button>
                                                                    </Dropdown.Item>
                                                                    {
                                                                        this.state.user ?
                                                                        <div>
                                                                            <DropdownItem as="div" onMouseEnter={this.handleMouseEnterDropdown} onMouseLeave={this.handleMouseLeaveDropdown}>
                                                                                <DropdownButton
                                                                                    as={ButtonGroup}
                                                                                    key="right"
                                                                                    className="home-screen-category-list-item-img-overlay-dropdown-menu-collection"
                                                                                    drop="right"
                                                                                    variant="secondary"
                                                                                    title="Add To Playlist"
                                                                                    show={this.state.showDropdown}
                                                                                >
                                                                                    {
                                                                                        this.state.playlists.map((playlist, playlist_ind) => 
                                                                                            <Dropdown.Item as="div" key={playlist_ind} onClick={this.handleAddSongToCollection.bind(this, obj._id, playlist._id)}>{playlist.name}</Dropdown.Item>
                                                                                        )
                                                                                    }
                                                                                    {
                                                                                        this.state.playlists.length > 0 ?
                                                                                        <Dropdown.Divider /> :
                                                                                        <div></div>
                                                                                    }
                                                                                    <Dropdown.Item onClick={this.handleShowCreateCollectionModal.bind(this, obj._id)}>Create Playlist</Dropdown.Item>
                                                                                </DropdownButton>
                                                                            </DropdownItem>
                                                                            {
                                                                                this.state.user && !this.state.user.likedSongs.includes(obj._id) ? 
                                                                                <Dropdown.Item>
                                                                                    <Button onClick={this.handleAddSongToFavorites.bind(this, obj._id)}>
                                                                                        Save To Favorites
                                                                                    </Button>
                                                                                </Dropdown.Item> :
                                                                                <Dropdown.Item>
                                                                                    <Button onClick={this.handleRemoveSongFromFavorites.bind(this, obj._id)}>
                                                                                        Remove From Favorites
                                                                                    </Button>
                                                                                </Dropdown.Item>
                                                                            }
                                                                        </div>
                                                                        : <div></div>
                                                                    }
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                            <Button className="home-screen-category-list-item-img-overlay-play-button" onClick={this.handlePlayItem.bind(this, obj)}>
                                                                <Image className="home-screen-category-list-item-img-overlay-play-button-icon" src={icon_play_white_1} roundedCircle/>
                                                            </Button>
                                                        </div>
                                                        <Card.Img className="home-screen-category-list-item-img" src={this.getItemImage(obj)} />
                                                    </div> 
                                                    : obj.type === "session" ?
                                                    <div className="home-screen-category-list-item-img-overlay-trigger">
                                                        <div className="home-screen-category-list-item-img-overlay-container">
                                                            <Button className="home-screen-category-list-item-img-overlay-join-button bg-color-harmony" onClick={this.handlePlayItem.bind(this, obj)}>
                                                                <div className="home-screen-category-list-item-img-overlay-join-button-text color-accented tiny-text">{obj.live ? "JOIN SESSION" : "PLAY AGAIN"}</div>
                                                            </Button>
                                                        </div>
                                                        <Card.Img className="home-screen-category-list-item-img" src={this.getItemImage(obj)} />
                                                    </div>
                                                    : obj.type === "collection" ?
                                                    <div className="home-screen-category-list-item-img-overlay-trigger">
                                                        <div className="home-screen-category-list-item-img-overlay-container">
                                                            <Dropdown className="home-screen-category-list-item-img-overlay-dropdown" as={ButtonGroup}>
                                                                <Dropdown.Toggle split className="home-screen-category-list-item-img-overlay-dropdown-button no-caret">
                                                                    <Image className="home-screen-category-list-item-img-overlay-dropdown-button-icon" src={menu_button_white} />
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu className="home-screen-category-list-item-img-overlay-dropdown-menu">
                                                                    <Dropdown.Item>
                                                                        <Button onClick={this.handleAddCollectionToFutureQueue.bind(this, obj)} disabled={this.props.shouldReceiveActions()}>
                                                                            Add To Queue
                                                                        </Button>
                                                                    </Dropdown.Item>
                                                                    {
                                                                        this.state.user ?
                                                                        <div>
                                                                            {
                                                                                this.state.user && !this.state.user.likedCollections.includes(obj._id) ? 
                                                                                <Dropdown.Item>
                                                                                    <Button onClick={this.handleAddCollectionToFavorites.bind(this, obj._id)}>
                                                                                        Save To Favorites
                                                                                    </Button>
                                                                                </Dropdown.Item> :
                                                                                <Dropdown.Item>
                                                                                    <Button onClick={this.handleRemoveCollectionFromFavorites.bind(this, obj._id)}>
                                                                                        Remove From Favorites
                                                                                    </Button>
                                                                                </Dropdown.Item>
                                                                            }
                                                                        </div>
                                                                        : <div></div>
                                                                    }
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                            <Button className="home-screen-category-list-item-img-overlay-play-button" onClick={this.handlePlayItem.bind(this, obj)}>
                                                                <Image className="home-screen-category-list-item-img-overlay-play-button-icon" src={icon_play_white_1} roundedCircle/>
                                                            </Button>
                                                        </div>
                                                        <Card.Img className="home-screen-category-list-item-img" src={this.getItemImage(obj)} />
                                                    </div>
                                                    : <Card.Img className="home-screen-category-list-item-img" src={this.getItemImage(obj)} />
                                                }
                                            <Card.Footer className="home-screen-category-list-item-footer">
                                                <div className="home-screen-category-list-item-title ellipsis-multi-line-overflow subtitle" onClick={this.handleGoToItem.bind(this, obj)}>{this.getItemName(obj)}</div>
                                                <div className="home-screen-category-list-item-creator ellipsis-multi-line-overflow body-text" onClick={this.handleGoToItemCreator.bind(this, obj)}>{this.getItemCreator(obj)}</div>
                                            </Card.Footer>
                                        </Card>
                                        )
                                }
                            </CardDeck>
                        </div> :
                        <div key={cat_ind}></div>)
                    }
                </div>
        }
        else {
            component = <Spinner/>
        }
        
        
        return(
            <div className={this.props.visible ? "visible" : "hidden"}>
                {component}
            </div>
        );
    }
}

export default HomeScreen;
