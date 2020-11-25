import React from 'react'
import { ListGroup, Image, Button, CardDeck, Card, InputGroup, FormControl, Dropdown, DropdownButton, ButtonGroup, Modal } from 'react-bootstrap'
import { delete_cross_white, delete_button_white, icon_play_white_1, menu_button_white, icon_music_1 } from '../graphics'
import SuggestionsAPI from '../api/SuggestionsAPI'
import DropdownItem from 'react-bootstrap/esm/DropdownItem';

const _ = require('lodash')

class SearchScreen extends React.Component {

    constructor(props) {
        super(props)
        this.suggestions = new SuggestionsAPI()
        this.newCollectionNameMaxLength = 50
        this.state = {
            user: this.props.user,
            query: "",
            suggestions: [],
            res: {},
            newCollectionName: "",
            currentSongTarget: "",
            showDropdown: false,
            showCreateCollectionModal: false
        }
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevState.user !== this.props.user) {
            this.setState({
                user: this.props.user
            })
        }
    }

    componentDidMount = () => {
        if (this.props.auth) {
            this.fetchPlaylists()
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
			this.props.axiosWrapper.axiosPost('main/api/createCollectionWithSong/' + this.state.newCollectionName + "&" + this.state.currentSongTarget, {}, (function(res, data){
				if (data.success) {
                    this.props.handleUpdateUser(data.data.user)
					this.props.history.push('/main/collection/' + data.data.collectionId)
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

    handleGoToHistoryItem = (e) => {
        
    }

    handlePlayItem = (id, e) => {
        this.props.playVideo(id)
    }

    handleClearSearchBox = () => {
        this.setState({
            query: "",
            suggestions: [],
            res: {},
        })
    }

    handleSearchQueryChange = (e) => {
        this.setState({
            query: e.target.value,
            res: {}
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
        // var newHistory = this.reindexArray(this.state.user.history.filter(ele => ele.index !== index))
        // this.setState({
        //     history: newHistory
        // })
    }

    reindexArray = (array) => {
        array = JSON.parse(JSON.stringify(array))
        for (var i = 0; i < array.length; i++) {
            array[i].index = i
        }
        return array
    }

    fetchPlaylists = () => {
        this.props.axiosWrapper.axiosGet('/api/search', (function(res, data) {
            if (data.success) {
                this.setState({
                    playlists: data.data.playlists
                })
            }
        }).bind(this), true)
    }

    fetchResults = (query) => {
        if (query.trim() !== "") {
            this.props.queryVideos(query).then(res => {
                var newRes = _.cloneDeep(this.state.res)
                newRes.songs = res
                this.setState({
                    res: newRes
                })
            })
            this.props.axiosWrapper.axiosGet('/api/search/query=' + query, (function(res, data) {
                if (data.success) {
                    var newRes = _.cloneDeep(this.state.res)
                    newRes.sessions = data.data.results.sessions
                    newRes.collections = data.data.results.collections
                    newRes.users = data.data.results.users
                    this.setState({
                        res: newRes
                    })
                }
            }).bind(this), true)
        }
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

    render() {
        return(
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
                        this.props.auth ? 
                        <div className="search-screen-history-title super-title color-accented">
                            Your Recent History
                        </div> :
                        <div></div>
                    }
                    <ListGroup>
                        {
                            this.state.user.history.map((obj, ind) => 
                                <ListGroup.Item className="search-screen-history-item" key={ind} onClick={e => this.handleGoToHistoryItem(e)} action>
                                    <div className="search-screen-history-item-type title color-contrasted">{obj.type.capitalize()}</div>
                                    <div className="search-screen-history-item-container">
                                        <Image className="search-screen-history-item-display-image" src={obj.image}/>
                                        <div className="search-screen-history-item-display-container">
                                            <div className="subtitle color-accented">{obj.name}</div>
                                            <div className="body-text color-accented">{obj.creator}</div>
                                        </div>
                                    </div>
                                    <div className="search-screen-history-item-remove-button" onClick={e => this.handleRemoveHistory(e, obj.index)}>
                                        <Image className="search-screen-history-item-remove-button-icon" src={delete_cross_white}/>
                                    </div>
                                </ListGroup.Item>
                                )
                        }
                    </ListGroup>
                </div>
                <div className={this.getResultsClass()}>
                    {Object.keys(this.state.res).map((category, cat_ind) => this.state.res[category] !== undefined && this.state.res[category].length > 0 ?
                        <div className="search-screen-results-category-container" key={cat_ind}>
                            <div className="search-screen-results-category-name title color-contrasted">{category.capitalize()}</div>
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
                                                                        <Button onClick={this.props.queue.addSongToFutureQueue.bind(this, obj)}>
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
                                                                                    className="search-screen-results-category-list-item-img-overlay-dropdown-menu-collection"
                                                                                    drop="right"
                                                                                    variant="secondary"
                                                                                    title="Add To Playlist"
                                                                                    show={this.state.showDropdown}
                                                                                >
                                                                                    {
                                                                                        this.state.user.playlists.map((playlist, playlist_ind) => 
                                                                                            <Dropdown.Item key={playlist_ind} onClick={this.handleAddSongToCollection.bind(this, obj.id, playlist._id)}>{playlist.name}</Dropdown.Item>
                                                                                        )
                                                                                    }
                                                                                    {
                                                                                        this.state.user.playlists.length > 0 ?
                                                                                        <Dropdown.Divider /> :
                                                                                        <div></div>
                                                                                    }
                                                                                    <Dropdown.Item onClick={this.handleShowCreateCollectionModal.bind(this, obj.id)}>Create Playlist</Dropdown.Item>
                                                                                </DropdownButton>
                                                                            </DropdownItem>
                                                                            {
                                                                                !this.state.user.likedSongs.includes(obj.id) ? 
                                                                                <Dropdown.Item>
                                                                                    <Button onClick={this.handleAddSongToFavorites.bind(this, obj.id)}>
                                                                                        Save To Favorites
                                                                                    </Button>
                                                                                </Dropdown.Item> :
                                                                                <Dropdown.Item>
                                                                                    <Button onClick={this.handleRemoveSongFromFavorites.bind(this, obj.id)}>
                                                                                        Remove From Favorites
                                                                                    </Button>
                                                                                </Dropdown.Item>
                                                                            }
                                                                        </div>
                                                                        : <div></div>
                                                                    }
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                            <Button className="search-screen-results-category-list-item-img-overlay-play-button" onClick={this.handlePlayItem.bind(this, obj.id)}>
                                                                <Image className="search-screen-results-category-list-item-img-overlay-play-button-icon" src={icon_play_white_1} roundedCircle/>
                                                            </Button>
                                                        </div>
                                                        <Card.Img className="search-screen-results-category-list-item-img" src={obj.image_high ? obj.image_high : obj.image_med ? obj.image_med : obj.image_std ? obj.image_std : obj.image ? obj.image : icon_music_1} />
                                                    </div> :
                                                    <Card.Img className="search-screen-results-category-list-item-img" src={obj.image_high ? obj.image_high : obj.image_med ? obj.image_med : obj.image_std ? obj.image_std : obj.image ? obj.image : icon_music_1} />
                                            }
                                            <Card.Body className="search-screen-results-category-list-item-body">
                                                <div className="subtitle color-jet">{obj.name}</div>
                                                <div className="body-text color-jet">{obj.creator}</div>
                                                {obj.type === "user" && obj.live === true ? 
                                                    <Card.Text className="body-text color-accented">{obj.sessions[0].name}</Card.Text> :
                                                    <div></div>
                                                }
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
}

export default SearchScreen;