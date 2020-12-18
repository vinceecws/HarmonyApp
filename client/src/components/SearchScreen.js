import React from 'react'
import Spinner from './Spinner';
import { ListGroup, Image, Button, CardDeck, Card, InputGroup, FormControl, Dropdown, DropdownButton, ButtonGroup, Modal } from 'react-bootstrap'
import { delete_cross_white, delete_button_white, icon_play_white_1, menu_button_white, icon_music_1, icon_sound_mixer_1, icon_playlist_2, icon_profile_image } from '../graphics'
import { ReactComponent as BackArrow } from '../graphics/user_pack/back-arrow-white.svg'
import { ReactComponent as NextArrow } from '../graphics/user_pack/next-arrow-white.svg'
import SuggestionsAPI from '../api/SuggestionsAPI'
import DropdownItem from 'react-bootstrap/esm/DropdownItem';
import { mainScreens } from '../const'

const _ = require('lodash')

class SearchScreen extends React.Component {

    constructor(props) {
        super(props)
        this.suggestions = new SuggestionsAPI()
        this.newCollectionNameMaxLength = 50
        this.state = {
            user: this.props.user,
            query: "",
            history: [],
            playlists: [],
            suggestions: [],
            res: {},
            newCollectionName: "",
            currentSongTarget: "",
            showDropdown: false,
            showCreateCollectionModal: false,
            history_loading: true,
            playlists_loading: true,
            song_nextPageToken: null,
            song_prevPageToken: null,
            collection_nextPageToken: null,
            collection_prevPageToken: null,
            session_nextPageToken: null,
            session_prevPageToken: null,
            user_nextPageToken: null,
            user_prevPageToken: null
        }
    }

    componentDidMount = () => {
        if (this.state.user) {
            this.setState({
                history_loading: true,
                playlists_loading: true
            }, () => {
                this.fetchPlaylists()
                this.fetchHistory()
            })
        }
        else {
            this.setState({
                history_loading: false,
                playlists_loading: false
            })
        }
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (!_.isEqual(prevState.user, this.props.user)) {
            this.setState({
                user: this.props.user,
                history_loading: true,
                playlists_loading: true
            }, () => {
                if (this.state.user) {
                    this.fetchPlaylists()
                    this.fetchHistory()
                }
                else {
                    this.setState({
                        history_loading: false,
                        playlists_loading: false
                    })
                }
            })
        }
    }

    isSearchBoxEmpty = () => {
        return this.state.query.trim() === ""
    }

    isResultsEmpty = () => {
        return Object.keys(this.state.res).length === 0
    }

    isSuggestionsEmpty = () => {
        return this.state.suggestions.length === 0
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

    handleGoToHistoryItem = (obj, e) => {
        if (obj.type === "collection") {
            this.props.switchScreen(mainScreens.COLLECTION, obj._id)
            this.handlePrependHistory(obj)
        }
        else if (obj.type === "user") {
            this.props.switchScreen(mainScreens.PROFILE, obj._id)
            this.handlePrependHistory(obj)
        }
        else if (obj.type === "song") {
            this.handlePlayItem(obj)
        }
    }

    handleGoToResultItem = (obj, e) => {
        if (obj.type === "session") {
            this.props.switchScreen(mainScreens.SESSION, obj._id)
        }
        else if (obj.type === "collection") {
            this.props.switchScreen(mainScreens.COLLECTION, obj._id)
            this.handlePrependHistory(obj)
        }
        else if (obj.type === "user") {
            this.props.switchScreen(mainScreens.PROFILE, obj._id)
            this.handlePrependHistory(obj)
        }
    }

    handleGoToResultCreator = (obj, e) => {
        if (obj.type === "session") {
            this.props.switchScreen(mainScreens.PROFILE, obj.hostId)
            this.handlePrependHistory({
                type: "user",
                _id: obj.hostId
            })
        }
        else if (obj.type === "collection") {
            this.props.switchScreen(mainScreens.PROFILE, obj.ownerId)
            this.handlePrependHistory({
                type: "user",
                _id: obj.ownerId
            })
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
            this.handlePrependHistory(obj)
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
				this.props.playVideo(songId, () => {
                    Promise.all(songList.map((songId) => {
                        return this.props.fetchVideoById(songId, true)
                    })).then((songs) => {
                        songs.forEach(song => this.handleAddSongToFutureQueue(song))
                    }).then(() => {
                        if (this.props.shouldStartSession()) {
                            this.handleCreateSession()
                        }
                    })
                    this.handlePrependHistory(obj)
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

    handleClearSearchBox = () => {
        this.setState({
            query: "",
            suggestions: [],
            res: {},
            song_nextPageToken: null,
            song_prevPageToken: null,
            collection_nextPageToken: null,
            collection_prevPageToken: null,
            session_nextPageToken: null,
            session_prevPageToken: null,
            user_nextPageToken: null,
            user_prevPageToken: null
        })
    }

    handleSearchQueryChange = (e) => {
        this.setState({
            query: e.target.value,
        })
        this.suggestions.query(e.target.value, this.handleUpdateSuggestions)
    }

    handleSearchQueryKeydown = (e) => {
        if (e.keyCode === 13) {
            this.setState({
                suggestions: []
            })
            this.fetchResults(this.state.query)
        }
    }

    handleUpdateSuggestions = (suggestions) => {
        this.setState({
            suggestions: suggestions
        })
    }

    handleSelectSuggestion = (key, e) => {
        var query = this.state.suggestions[parseInt(key)]
        this.setState({
            query: query,
            suggestions: []
        })
        this.fetchResults(query)
    }

    handleRemoveHistory = (e, index) => {
        e.stopPropagation()
        if (!this.state.user) {
            return
        }

        this.props.axiosWrapper.axiosPost('/api/search/history/remove/' + index, {}, (function(res, data) {
            if (data.success) {
                this.props.handleUpdateUser(data.data.user)
            }
        }).bind(this), true)
    }

    handlePrependHistory = (obj) => {
        if (!this.state.user) {
            return
        }
        this.props.axiosWrapper.axiosPost('/api/search/history/prepend', {
            type: obj.type,
            _id: obj._id
        }, (function(res, data) {
            if (data.success) {
                this.props.handleUpdateUser(data.data.user)
            }
        }).bind(this), true)
    }

    handleFetchPage = (type, which) => {
        var pageToken
        switch (type) {
            case "song":
                pageToken = this.state["song_" + which + "PageToken"]
                if (!pageToken) {
                    return
                }
                this.props.queryVideos(this.state.query, pageToken).then(res => {
                    var newRes = _.cloneDeep(this.state.res)
                    newRes.song = res.res
                    this.setState({
                        song_nextPageToken: res.nextPageToken,
                        song_prevPageToken: res.prevPageToken,
                        res: newRes
                    })
                })
                break
            case "session":
            case "collection":
            case "user":
                pageToken = this.state[type + "_" + which + "PageToken"]
                if (!pageToken) {
                    return
                }
                this.props.axiosWrapper.axiosGet('/api/search/pageQuery=' + this.state.query + '&category=' + type + '&pageToken=' + pageToken, (function(res, data) {
                    if (data.success) {
                        var newRes = _.cloneDeep(this.state.res)
                        newRes[type] = data.data.items
    
                        var newState = {
                            res: newRes
                        }
                        newState[type + "_nextPageToken"] = data.data.nextPageToken
                        newState[type + "_prevPageToken"] = data.data.prevPageToken

                        this.setState(newState)
                    }
                }).bind(this), true)
                break
            default:
                break
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

    fetchHistory = () => {
        this.props.axiosWrapper.axiosGet('/api/search/history', (function(res, data) {
            if (data.success) {
                Promise.all(data.data.history.map((obj) => {
                    if (obj.type === "song") {
                        return this.props.fetchVideoById(obj._id, true)
                    }
                    return obj
                })).then((history) => {
                    this.setState({
                        history: history,
                        history_loading: false
                    })
                })
            }
        }).bind(this), true)
    }

    fetchResults = (query) => {
        if (query.trim() !== "") {
            this.props.queryVideos(query).then(res => {
                var newRes = _.cloneDeep(this.state.res)
                newRes.song = res.res
                this.setState({
                    song_nextPageToken: res.nextPageToken,
                    song_prevPageToken: res.prevPageToken,
                    res: newRes
                })
            })
            this.props.axiosWrapper.axiosGet('/api/search/query=' + query, (function(res, data) {
                if (data.success) {
                    var newRes = _.cloneDeep(this.state.res)
                    newRes.session = data.data.session.items
                    newRes.collection = data.data.collection.items
                    newRes.user = data.data.user.items

                    this.setState({
                        res: newRes,
                        session_nextPageToken: data.data.session.nextPageToken,
                        session_prevPageToken: data.data.session.prevPageToken,
                        collection_nextPageToken: data.data.collection.nextPageToken,
                        collection_prevPageToken: data.data.collection.prevPageToken,
                        user_nextPageToken: data.data.user.nextPageToken,
                        user_prevPageToken: data.data.user.prevPageToken
                    })
                }
            }).bind(this), true)
        }
    }

    getHistoryItemCreator = (obj) => {
        if (obj.type === "collection") {
            return obj.ownerName
        }
        return obj.creator
    }

    getHistoryItemName = (obj) => {
        if (obj.type === "user") {
            return obj.username
        }
        return obj.name
    }

    setImage = (image) => {
        return 'data:' + image.contentType + ';base64,' + btoa(image.data);
    }

    getHistoryItemImage = (obj) => {
        if (obj.type === "song") {
            return obj.image_high ? obj.image_high : obj.image_med ? obj.image_med : obj.image_std ? obj.image_std : obj.image ? obj.image : icon_music_1
        }
        else if (obj.type === "collection") {
            return obj.image && obj.image.data ? this.setImage(obj.image) : icon_playlist_2
        }
        else if (obj.type === "user") {
            return obj.image && obj.image.data ? this.setImage(obj.image) : icon_profile_image
        }

        return obj.image 
    }

    getCharLengthClass = () => {
        return this.state.newCollectionName.length === 0 || this.handleValidateNewCollectionName() ? "color-accented body-text" : "color-alert body-text"
    }

    getShowSuggestions = () => {
        return this.isSuggestionsEmpty() ? false : true
    }

    getHistoryClass = () => {
        return this.isSearchBoxEmpty() ? "search-screen-history visible" : "search-screen-history collapsed"
    }

    getResultsClass = () => {
        return this.isSearchBoxEmpty() ? "search-screen-results collapsed" : "search-screen-results visible"
    }

    getPageArrowClass = (category, which) => {
        return this.state[category + "_" + which + "PageToken"] ? "search-screen-results-category-page-arrow" : "search-screen-results-category-page-arrow disabled"
    }

    render() {
        var component
        if (this.state.playlists_loading || this.state.history_loading) {
            component = <Spinner/>
        }
        else {
            component = (
                <div className="search-screen-container">
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
                    <div className="search-screen-search-box-group-container">
                        <InputGroup className="search-screen-search-box-container">
                            <FormControl 
                                className="search-screen-search-box body-text" 
                                placeholder="Search sessions, collections and more"
                                value={this.state.query} 
                                onChange={e => this.handleSearchQueryChange(e)}
                                onKeyDown={e => this.handleSearchQueryKeydown(e)}/>
                            <InputGroup.Append>
                                <Button className="search-screen-search-box-clear-button" onClick={e => this.handleClearSearchBox(e)}>
                                    <Image className="search-screen-search-box-clear-button-icon" src={delete_button_white}/>
                                </Button>
                            </InputGroup.Append>
                        </InputGroup> 
                        <Dropdown role='menu'>
                            <Dropdown.Menu id="search-screen-search-box-suggestions-dropdown" show={this.getShowSuggestions()}>
                                {
                                    this.state.suggestions.map((suggestion, ind) => 
                                        <Dropdown.Item eventKey={String(ind)} key={ind} onSelect={(key, e) => this.handleSelectSuggestion(key, e)}>{suggestion}</Dropdown.Item>
                                    )
                                }
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <div className={this.getHistoryClass()}>
                        {
                            this.state.user ? 
                            <div className="search-screen-history-title super-title color-accented">
                                Your Recent History
                            </div> :
                            <div></div>
                        }
                        <ListGroup>
                            {
                                this.state.user ? this.state.history.map((obj, ind) => 
                                    <ListGroup.Item className="search-screen-history-item" key={ind} onClick={e => this.handleGoToHistoryItem(obj, e)} action>
                                        <div className="search-screen-history-item-type title color-contrasted">{obj.type.capitalize()}</div>
                                        <div className="search-screen-history-item-container">
                                            {
                                                obj.type === "collection" || obj.type === "song" ?
                                                <div className="search-screen-history-item-img-overlay-trigger">
                                                    <div className="search-screen-history-item-img-overlay-container">
                                                        <div className="search-screen-history-item-img-overlay-play-button" onClick={(e) => {e.stopPropagation(); this.handlePlayItem(obj)}}>
                                                            <Image className="search-screen-history-item-img-overlay-play-button-icon" src={icon_play_white_1} roundedCircle/>
                                                        </div>
                                                    </div>
                                                    <Image className="search-screen-history-item-display-image" src={this.getHistoryItemImage(obj)}/>
                                                </div>
                                                : <Image className="search-screen-history-item-display-image" src={this.getHistoryItemImage(obj)}/>
                                            }
                                            <div className="search-screen-history-item-display-container">
                                                <div className="subtitle color-accented">{this.getHistoryItemName(obj)}</div>
                                                <div className="body-text color-accented">{this.getHistoryItemCreator(obj)}</div>
                                            </div>
                                        </div>
                                        <div className="search-screen-history-item-remove-button" onClick={e => this.handleRemoveHistory(e, ind)}>
                                            <Image className="search-screen-history-item-remove-button-icon" src={delete_cross_white}/>
                                        </div>
                                    </ListGroup.Item>
                                    ) :
                                    <div></div>
                            }
                        </ListGroup>
                    </div>
                    <div className={this.getResultsClass()}>
                        {Object.keys(this.state.res).map((category, cat_ind) => this.state.res[category] !== undefined && this.state.res[category].length > 0 ?
                            <div className="search-screen-results-category-container" key={cat_ind}>
                                <div className="search-screen-results-category-header">
                                    <div className="search-screen-results-category-name title color-contrasted">{category.capitalize() + "s"}</div>
                                    <BackArrow className={this.getPageArrowClass(category, "prev")} onClick={e => this.handleFetchPage(category, "prev")}/>
                                    <NextArrow className={this.getPageArrowClass(category, "next")} onClick={e => this.handleFetchPage(category, "next")}/>
                                </div>
                                <CardDeck className="search-screen-results-category-list">
                                    {
                                        this.state.res[category].map((obj, item_ind) => 
                                            <Card className="search-screen-results-category-list-item" key={item_ind}>
                                                {obj.type === "session" && obj.live === true ? 
                                                    <Card.Text className="search-screen-results-list-item-live-indicator tiny-text color-accented">LIVE</Card.Text> :
                                                    <div></div>
                                                }
                                                {obj.type === "user" && obj.live === true ? 
                                                    <Card.Text className="search-screen-results-list-item-streaming-indicator tiny-text color-accented">STREAMING NOW</Card.Text> :
                                                    <div></div>
                                                }
                                                {
                                                    obj.type === "song" ? 
                                                        <div className="search-screen-results-category-list-item-img-overlay-trigger">
                                                            <div className="search-screen-results-category-list-item-img-overlay-container">
                                                                <Dropdown className="search-screen-results-category-list-item-img-overlay-dropdown" as={ButtonGroup}>
                                                                    <Dropdown.Toggle split className="search-screen-results-category-list-item-img-overlay-dropdown-button no-caret">
                                                                        <Image className="search-screen-results-category-list-item-img-overlay-dropdown-button-icon" src={menu_button_white} />
                                                                    </Dropdown.Toggle>
                                                                    <Dropdown.Menu className="search-screen-results-category-list-item-img-overlay-dropdown-menu">
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
                                                                                        className="search-screen-results-category-list-item-img-overlay-dropdown-menu-collection"
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
                                                                <Button className="search-screen-results-category-list-item-img-overlay-play-button" onClick={this.handlePlayItem.bind(this, obj)}>
                                                                    <Image className="search-screen-results-category-list-item-img-overlay-play-button-icon" src={icon_play_white_1} roundedCircle/>
                                                                </Button>
                                                            </div>
                                                            <Card.Img className="search-screen-results-category-list-item-img" src={obj.image_high ? obj.image_high : obj.image_med ? obj.image_med : obj.image_std ? obj.image_std : obj.image ? obj.image : icon_music_1} />
                                                        </div> 
                                                        : obj.type === "session" ?
                                                        <div className="search-screen-results-category-list-item-img-overlay-trigger">
                                                            <div className="search-screen-results-category-list-item-img-overlay-container">
                                                                <Button className="search-screen-results-category-list-item-img-overlay-join-button bg-color-harmony" onClick={this.handlePlayItem.bind(this, obj)}>
                                                                    <div className="search-screen-results-category-list-item-img-overlay-join-button-text color-accented tiny-text">{obj.live ? "JOIN SESSION" : "PLAY AGAIN"}</div>
                                                                </Button>
                                                            </div>
                                                            <Card.Img className="search-screen-results-category-list-item-img" src={obj.image && obj.image.data ? this.setImage(obj.image) : icon_sound_mixer_1} />
                                                        </div>
                                                        : obj.type === "collection" ?
                                                        <div className="search-screen-results-category-list-item-img-overlay-trigger">
                                                            <div className="search-screen-results-category-list-item-img-overlay-container">
                                                                <Dropdown className="search-screen-results-category-list-item-img-overlay-dropdown" as={ButtonGroup}>
                                                                    <Dropdown.Toggle split className="search-screen-results-category-list-item-img-overlay-dropdown-button no-caret">
                                                                        <Image className="search-screen-results-category-list-item-img-overlay-dropdown-button-icon" src={menu_button_white} />
                                                                    </Dropdown.Toggle>
                                                                    <Dropdown.Menu className="search-screen-results-category-list-item-img-overlay-dropdown-menu">
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
                                                                <Button className="search-screen-results-category-list-item-img-overlay-play-button" onClick={this.handlePlayItem.bind(this, obj)}>
                                                                    <Image className="search-screen-results-category-list-item-img-overlay-play-button-icon" src={icon_play_white_1} roundedCircle/>
                                                                </Button>
                                                            </div>
                                                            <Card.Img className="search-screen-results-category-list-item-img" src={obj.image && obj.image.data ? this.setImage(obj.image) : icon_playlist_2} />
                                                        </div>
                                                        : <Card.Img className="search-screen-results-category-list-item-img" src={obj.image && obj.image.data ? this.setImage(obj.image) : icon_profile_image} />
                                                }
                                                <Card.Body className="search-screen-results-category-list-item-body">
                                                    <div className="search-screen-results-category-list-item-body-title ellipsis-multi-line-overflow subtitle color-jet" onClick={this.handleGoToResultItem.bind(this, obj)}>{obj.type === "user" ? obj.username : obj.name}</div>
                                                    <div className="search-screen-results-category-list-item-body-creator ellipsis-multi-line-overflow body-text color-jet" onClick={this.handleGoToResultCreator.bind(this, obj)}>{obj.type === "session" ? obj.hostName : obj.type === "collection" ? obj.ownerName : obj.type === "song" ? obj.creator : ""}</div>
                                                </Card.Body>
                                            </Card>
                                            )
                                    }
                                </CardDeck>
                            </div> : 
                            <div key={cat_ind}></div>)
                        }
                    </div>
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

export default SearchScreen;