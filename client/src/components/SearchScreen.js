import React from 'react'
import { ListGroup, Image, Button, CardDeck, Card, InputGroup, FormControl } from 'react-bootstrap'
import { genSampleHistory, genSampleResults } from '../test/genSamples'
import { delete_cross_white, delete_button_white } from '../graphics'

class SearchScreen extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            query: "",
            history: this.fetchHistory()
        }
    }

    isSearchBoxEmpty = () => {
        return this.state.query.trim() === ""
    }

    handleGoToItem = (e) => {
        
    }

    handlePlayItem = (e) => {
        
    }

    handleClearSearchBox = () => {
        this.setState({
            query: ""
        })
    }

    handleSearchQueryChange = (e) => {
        this.setState({
            query: e.target.value
        })
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
        return genSampleHistory(10)
    }

    fetchResults = (query) => {
        return genSampleResults(query.toLowerCase())
    }

    /*
        In practice, this will fetch the song's image from the given URL
    */
    fetchImage = () => {
        
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
                <InputGroup className="search-screen-search-box-container">
                    <FormControl 
                        className="search-screen-search-box body-text" 
                        placeholder="Search songs, collections and more"
                        value={this.state.query} 
                        onChange={e => this.handleSearchQueryChange(e)}/>
                    <InputGroup.Append>
                        <Button className="search-screen-search-box-clear-button" onClick={e => this.handleClearSearchBox(e)}>
                            <Image className="search-screen-search-box-clear-button-icon" src={delete_button_white}/>
                        </Button>
                    </InputGroup.Append>
                </InputGroup>
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
                    {this.fetchResults(this.state.query).map(category => category.results !== undefined && category.results.length > 0 ?
                        <div className="search-screen-results-category-container">
                            <div className="search-screen-results-category-name title color-contrasted">{category.categoryName}</div>
                            <CardDeck className="search-screen-results-category-list">
                                {
                                    category.results.map(obj => 
                                        <Card className="search-screen-results-category-list-item">
                                            <Card.Img className="search-screen-results-category-list-item-img" src={obj.image}/>
                                            <Card.Footer className="search-screen-results-category-list-item-footer">
                                                <div className="subtitle color-accented">{obj.name}</div>
                                                <div className="body-text color-accented">{obj.creator}</div>
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