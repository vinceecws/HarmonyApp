import React from 'react'
import { ListGroup, Image, Button, CardDeck, Card, InputGroup, FormControl, Dropdown } from 'react-bootstrap'
import { genSampleResults } from '../test/genSamples'
import { delete_cross_white, delete_button_white } from '../graphics'

import SuggestionsAPI from '../api/SuggestionsAPI'

const _ = require('lodash');

class SearchScreen extends React.Component {

    constructor(props) {
        super(props)
        this.suggestions = new SuggestionsAPI()
        this.state = {
            query: "",
            history: this.fetchHistory(),
            suggestions: [],
            res: {}
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

    handleGoToItem = (e) => {
        
    }

    handlePlayItem = (e) => {
        
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

    fetchHistory = () => {
        return this.props.history
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
            this.setState({
                res: genSampleResults(query.toLowerCase())
            })
        }
    }

    /*
        In practice, this will fetch the song's image from the given URL
    */
    fetchImage = () => {
        
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
                    <Dropdown.Menu id="search-screen-search-box-suggestions-dropdown" menuRole="menu" show={this.getShowSuggestions()}>
                        {
                            this.state.suggestions.map((suggestion, ind) => 
                                <Dropdown.Item eventKey={String(ind)} onSelect={(key, e) => this.handleSelectSuggestion(key, e)}>{suggestion}</Dropdown.Item>
                            )
                        }
                    </Dropdown.Menu>
                </div>
                <div className={this.getHistoryClass()}>
                    <div className="search-screen-history-title super-title color-accented">
                        Your Recent History
                    </div>
                    <ListGroup>
                        {
                            this.state.history.map(obj => 
                                <ListGroup.Item className="search-screen-history-item" onClick={e => this.handleGoToItem(e)} action>
                                    <div className="search-screen-history-item-type title color-contrasted">{obj.type.capitalize()}</div>
                                    <div className="search-screen-history-item-container">
                                        <Image className="search-screen-history-item-display-image" src={obj.image}/>
                                        <div className="search-screen-history-item-display-container">
                                            <div className="subtitle color-accented">{obj.name}</div>
                                            <div className="body-text color-accented">{obj.creator}</div>
                                        </div>
                                    </div>
                                    <Button className="search-screen-history-item-remove-button" onClick={e => this.handleRemoveHistory(e, obj.index)}>
                                        <Image className="search-screen-history-item-remove-button-icon" src={delete_cross_white}/>
                                    </Button>
                                </ListGroup.Item>
                                )
                        }
                    </ListGroup>
                </div>
                <div className={this.getResultsClass()}>
                    {Object.keys(this.state.res).map(category => this.state.res[category] !== undefined && this.state.res[category].length > 0 ?
                        <div className="search-screen-results-category-container">
                            <div className="search-screen-results-category-name title color-contrasted">{category.capitalize()}</div>
                            <CardDeck className="search-screen-results-category-list">
                                {
                                    this.state.res[category].map(obj => 
                                        <Card className="search-screen-results-category-list-item">
                                            {obj.type === "session" && obj.live === true ? 
                                                <Card.Text className="search-screen-results-list-item-live-indicator tiny-text color-accented">LIVE</Card.Text> :
                                                <div></div>
                                            }
                                            {obj.type === "user" && obj.live === true ? 
                                                <Card.Text className="search-screen-results-list-item-streaming-indicator tiny-text color-accented">STREAMING NOW</Card.Text> :
                                                <div></div>
                                            }
                                            <Card.Img className="search-screen-results-category-list-item-img" src={obj.image}/>
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