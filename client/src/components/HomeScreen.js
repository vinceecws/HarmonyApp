import React from 'react';
import { CardDeck, Card } from 'react-bootstrap';
import { genSampleImage, genSampleSuggestions } from '../test/genSamples'

class HomeScreen extends React.Component {

    /*
        In practice, getSuggestions returns a dynamically generated array of suggestions
        where each suggestion is an object that contains the category name of the suggestion
        and the array of suggested Objects
    */
    getSuggestions = () => {
        return genSampleSuggestions()
    }

    /*
        In practice, fetchImage will fetch the song's image from the given URL
    */
    fetchImage = () => {
        return genSampleImage()
    } 
  
    render() {
        let suggestions = this.getSuggestions().map(category => 
        <div className="home-screen-category-container">
            <div className="home-screen-category-name">{category.categoryName}</div>
            <CardDeck className="home-screen-category-list">
                {
                    category.suggestions.map(obj => 
                        <Card className="home-screen-category-list-item">
                            <Card.Img className="home-screen-category-list-item-img" src={this.fetchImage(obj)}/>
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
