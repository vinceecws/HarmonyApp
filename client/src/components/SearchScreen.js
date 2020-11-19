import React from 'react'
import { ListGroup, Image, Button, CardDeck, Card, InputGroup, FormControl, Dropdown, ButtonGroup } from 'react-bootstrap'
import { delete_cross_white, delete_button_white, icon_play_2, menu_button_white } from '../graphics'
import Spinner from './Spinner';
import SuggestionsAPI from '../api/SuggestionsAPI'

const _ = require('lodash');

class SearchScreen extends React.Component {

    constructor(props) {
        super(props)
        this.suggestions = new SuggestionsAPI()
        this.state = {
            query: "",
            history: [],
            playlists: [],
            likedSongs: [],
            suggestions: [],
            res: {},
            loading: this.props.auth ? true : false
        }
        this.fetchHistoryAndCollections()
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

    handleAddSongToFavorites = (songId, e) => {
        this.props.axiosWrapper.axiosPost('/main/search/addSongToFavorites/' + songId, {}, (function(res, data) {
            if (data.success) {
                this.setState({
                    likedSongs: data.data.likedSongs
                })
            }
        }).bind(this), true)
    }

    handleAddSongToCollection = (songId, collectionId, e) => {
        this.props.axiosWrapper.axiosPost('/main/search/addSongToCollection/' + songId + '&' + collectionId, {}, (function(res, data) {
            if (!data.success) {
                console.log("ERROR")
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
        var newHistory = this.reindexArray(this.state.history.filter(ele => ele.index !== index))
        this.setState({
            history: newHistory
        })
    }

    reindexArray = (array) => {
        array = JSON.parse(JSON.stringify(array))
        for (var i = 0; i < array.length; i++) {
            array[i].index = i
        }
        return array
    }

    fetchHistoryAndCollections = () => {
        if (this.props.auth) {
            this.props.axiosWrapper.axiosGet('/main/search', (function(res, data) {
                if (data.success) {
                    this.setState({
                        history: data.data.history,
                        playlists: data.data.playlists,
                        likedSongs: data.data.likedSongs,
                        loading: false
                    })
                }
            }).bind(this), true)
        }
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
            this.props.axiosWrapper.axiosGet('/main/search/query=' + query, (function(res, data) {
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
                    <Dropdown.Menu id="search-screen-search-box-suggestions-dropdown" show={this.getShowSuggestions()}>
                        {
                            this.state.suggestions.map((suggestion, ind) => 
                                <Dropdown.Item eventKey={String(ind)} key={ind} onSelect={(key, e) => this.handleSelectSuggestion(key, e)}>{suggestion}</Dropdown.Item>
                            )
                        }
                    </Dropdown.Menu>
                </div>
                {
                    !this.state.loading ? 
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
                                this.state.history.map((obj, ind) => 
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
                    </div> :
                    <Spinner id="search-screen-history-spinner"/>
                }
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
                                                                            <Dropdown.Item>
                                                                                <Button onClick={this.handleAddSongToCollection.bind(this, obj.id)}>
                                                                                    Add To Collection
                                                                                </Button>
                                                                            </Dropdown.Item>
                                                                            {
                                                                                !this.state.likedSongs.includes(obj.id) ? 
                                                                                <Dropdown.Item>
                                                                                    <Button onClick={this.handleAddSongToFavorites.bind(this, obj.id)}>
                                                                                        Save To Favorites
                                                                                    </Button>
                                                                                </Dropdown.Item> :
                                                                                <div></div>
                                                                            }
                                                                        </div>
                                                                        : <div></div>
                                                                    }
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                            <Button className="search-screen-results-category-list-item-img-overlay-play-button" onClick={this.handlePlayItem.bind(this, obj.id)}>
                                                                <Image className="search-screen-results-category-list-item-img-overlay-play-button-icon" src={icon_play_2}/>
                                                            </Button>
                                                        </div>
                                                        <Card.Img className="search-screen-results-category-list-item-img" src={obj.image} />
                                                    </div> :
                                                    <Card.Img className="search-screen-results-category-list-item-img" src={obj.image} />
                                            }
                                            <Card.Footer className="search-screen-results-category-list-item-footer">
                                                <div className="subtitle color-accented">{obj.name}</div>
                                                <div className="body-text color-accented">{obj.creator}</div>
                                                {obj.type === "user" && obj.live === true ? 
                                                    <Card.Text className="body-text color-accented">{obj.sessions[0].name}</Card.Text> :
                                                    <div></div>
                                                }
                                            </Card.Footer>
                                        </Card>
                                        )
                                }
                            </CardDeck>
                        </div> : 
                        <div></div>)
                    }
                </div>
            </div>
        )
    }
}

export default SearchScreen;