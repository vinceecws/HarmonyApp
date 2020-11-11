import React from 'react';
import { CardDeck, Card } from 'react-bootstrap';
import { genSampleSuggestions } from '../test/genSamples'
import axios from 'axios';
import {axiosGet, axiosPost} from './axiosWrapper/axiosWrapper.js';
import Spinner from './Spinner';

class HomeScreen extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loading: true
        }
        this.getHomeInfo();
    }
    

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
      
      return axiosGet('/main/home', this.handleLoad);
    }
    /*
        In practice, fetchImage will fetch the song's image from the given URL
    */
    fetchImage = () => {
        
    } 
    handleLoad = (status,data) =>{
        if(status == 200){
            console.log(status);
            console.log(data);
            this.setState({
                loading: false
            });
        }
    }
  
    render() {
        let renderContainer = false
        
        
        if (!this.state.loading){
            renderContainer = 
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
        }
        else{
            renderContainer = <Spinner/>
        }
        
        
        return(
            renderContainer
        );
    }
}

export default HomeScreen;
