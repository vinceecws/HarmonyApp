import React from 'react';
import { CardDeck, Card } from 'react-bootstrap';
import { genSampleSuggestions } from '../test/genSamples'

class HomeScreen extends React.Component {

    /*
        In practice, fetchSuggestions returns a dynamically generated array of suggestions
        where each suggestion is an object that contains the category name of the suggestion
        and the array of suggested Objects
    */
    fetchSuggestions = () => {
        return genSampleSuggestions()
    }

    /*
        In practice, fetchImage will fetch the song's image from the given URL
    */
    fetchImage = () => {
        
    } 
  
    render() {
        return(
            <div id="home-screen-container">
                {this.fetchSuggestions().map(category => category.suggestions !== undefined && category.suggestions.length > 0 ?
                    <div className="home-screen-category-container">
                        <div className="home-screen-category-name title color-contrasted">{category.categoryName}</div>
                        <CardDeck className="home-screen-category-list">
                            {
                                category.suggestions.map(obj => 
                                    <Card className="home-screen-category-list-item">
                                        <Card.Img className="home-screen-category-list-item-img" src={obj.image}/>
                                        <Card.Footer className="home-screen-category-list-item-footer">
                                            <div className="subtitle">{obj.name}</div>
                                            <div className="body-text">{obj.creator}</div>
                                        </Card.Footer>
                                    </Card>
                                    )
                            }
                        </CardDeck>
                    </div> :
                    <div></div>)
                }
            </div>
        )
    }
}

export default HomeScreen;
