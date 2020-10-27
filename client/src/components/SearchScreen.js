import React from 'react'
import { ListGroup, Image, Button } from 'react-bootstrap'
import { genSampleImage, genSampleHistory, genSampleResults } from '../test/genSamples'
import { delete_cross_white } from '../graphics'

class SearchScreen extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            query: "",
            history: this.fetchHistory()
        }
    }

    goToItem = (e) => {
        
    }

    searchBoxIsEmpty = () => {
        return this.state.query.trim() === ""
    }

    clearSearchBox = () => {
        this.setState({
            query: ""
        })
    }

    removeHistory = (e) => {
        e.stopPropagation()
    }

    reindexHistory = () => {

    }

    fetchHistory = () => {
        return genSampleHistory(10)
    }

    fetchResults = () => {
        return genSampleResults()
    }

    /*
        In practice, this will fetch the song's image from the given URL
    */
    fetchImage = () => {
        return genSampleImage()
    }

    getCreator = (obj) => {
        switch(obj.type) {
            case "session":
                return obj.hostName
            case "collection":
                return obj.user
            case "song":
                return obj.artist
            case "user":
                return ""
        }
    }

    render() {
        return(
            <ListGroup className="search-screen-history">
                {
                    this.state.history.map(obj => 
                        <ListGroup.Item className="search-screen-history-item" onClick={e => this.goToItem(e)} action>
                            <div className="search-screen-history-item-type title color-contrasted">{obj.type.capitalize()}</div>
                            <div className="search-screen-history-item-container">
                                <Image className="search-screen-history-item-display-image" src={this.fetchImage()}/>
                                <div className="search-screen-history-item-display-container">
                                    <div className="search-screen-history-item-display-name subtitle color-accented">{obj.name}</div>
                                    <div className="search-screen-history-item-display-creator body-text color-accented">{this.getCreator(obj)}</div>
                                </div>
                            </div>
                            <Button className="search-screen-history-item-remove-button" onClick={e => this.removeHistory(e)}>
                                <Image className="search-screen-history-item-remove-button-icon" src={delete_cross_white}/>
                            </Button>
                        </ListGroup.Item>
                        )
                }
            </ListGroup>
        )
    }
}

export default SearchScreen;