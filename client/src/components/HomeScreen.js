import React from 'react';
import { CardDeck, Card } from 'react-bootstrap';
import { genSampleSuggestions } from '../test/genSamples'
import axios from 'axios';

class HomeScreen extends React.Component {

    handleGoToItem = () => {

    }

    handlePlayItem = () => {
        
    }

    /*
        In practice, fetchSuggestions returns a dynamically generated array of suggestions
        where each suggestion is an object that contains the category name of the suggestion
        and the array of suggested Objects
    */
    fetchSuggestions = () => {
        
        return genSampleSuggestions()
    }
    getHomeInfo = () => {
        return axios.get('http://localhost:4000/main/home')
            .then(response => {
                console.log(response)
            })
            .catch(function (error){
                console.log(error);
            });
    }

    /*
        In practice, fetchImage will fetch the song's image from the given URL
    */
    fetchImage = () => {
        
    } 
  
    render() {
        this.getHomeInfo();
        return(
            <div id="home-screen-container">
                {this.fetchSuggestions().map(category => category.suggestions !== undefined && category.suggestions.length > 0 ?
                    <div className="home-screen-category-container">
                        <div className="home-screen-category-name title color-contrasted">{category.categoryName}</div>
                        <CardDeck className="home-screen-category-list">
                            {
                                category.suggestions.map(obj => 
                                    <Card className="home-screen-category-list-item">
                                        {obj.type === "user" && obj.live === true ? 
                                                <Card.Text className="home-screen-category-list-item-live-indicator tiny-text color-accented">LIVE</Card.Text> :
                                                <div></div>
                                        }
                                        <Card.Img className="home-screen-category-list-item-img" src={obj.image}/>
                                        <Card.Footer className="home-screen-category-list-item-footer">
                                            <div className="subtitle">{obj.name}</div>
                                            <div className="body-text">{obj.creator}</div>
                                            {obj.type === "user" && obj.live === true ? 
                                                    <div className="body-text">{obj.sessions[0].name}</div> :
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
        )
    }
}

export default HomeScreen;
