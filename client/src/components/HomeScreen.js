import React from 'react';
import { Container, Row, Col, CardDeck, Card } from 'react-bootstrap';
import * as icons from '../test'

let sessions = require('../test/sampleSessions.json')
let collections = require('../test/sampleCollections.json')
let songs = require('../test/sampleSongs.json')
let users = require('../test/sampleUsers.json')

class HomeScreen extends React.Component {

    /*
        In practice, getSuggestions returns a dynamically generated array of suggestions
        where each suggestion is an object that contains the category name of the suggestion
        and the array of suggested Objects
    */
    getSuggestions = () => {
        return [
            {
                categoryName: "Your Top Hosts",
                suggestions: users
            }, 
            {
                categoryName: "Recently Streamed",
                suggestions: sessions
            },
            {
                categoryName: "Recommended For You",
                suggestions: collections
            },
            {
                categoryName: "Listen Again",
                suggestions: songs
            }
        ]
    }

    getObjImage = (obj) => {
        let keys = Object.keys(icons);
        return icons[keys[keys.length * Math.random() << 0]];
    } 
  
    render() {
        let suggestions = this.getSuggestions().map(category => 
        <div className="home-screen-category-container">
            <div className="home-screen-category-name">{category.categoryName}</div>
            <CardDeck className="home-screen-category-list">
                {
                    category.suggestions.map(obj => 
                        <Card className="home-screen-category-list-item">
                            <Card.Img className="home-screen-category-list-item-img" src={this.getObjImage(obj)}/>
                            <Card.Footer className="home-screen-category-list-item-footer">
                                <div>{obj.name}</div>
                            </Card.Footer>
                        </Card>
                        )
                }
            </CardDeck>
        </div>)

        return(
        <div id="home-screen-container">
                {suggestions}
        </div>
        )
    }
}

export default HomeScreen;
