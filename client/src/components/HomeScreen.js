import React from 'react';
import { CardDeck, Card } from 'react-bootstrap';
import { icon_music_1, icon_playlist_2, icon_profile_image } from '../graphics'
import Spinner from './Spinner';
import { mainScreens } from '../const'

const _ = require('lodash')

class HomeScreen extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            suggestions: [],
            user: this.props.user,
            loading: false
        }
    }

    componentDidMount = () => {
        this.topSessionsListener = this.props.sessionManager.subscribeToAction("rcvdTopSessions", this.handleSetTopSessions.bind(this))
        this.sugggestionsRefresher = setInterval(() => {
            if (!this.state.loading) {
                this.setState({
                    loading: true,
                }, this.fetchSuggestions)
            }
        }, 5*60*1000) //Refresh at 5-minute intervals
        this.setState({
            loading: true,
        }, this.fetchSuggestions)
    }

    componentWillUnmount = () => {
        this.topSessionsListener = this.props.sessionManager.unsubscribeFromAction("rcvdTopSessions", this.topSessionsListener)
        clearInterval(this.sugggestionsRefresher)
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (!_.isEqual(prevState.user, this.props.user)) {
            this.setState({
                user: this.props.user
            })
        }
    }

    handleSetTopSessions = (event, sessions) => {
        sessions = sessions.map(session => {
            session.type = "session"
            return session
        })

        var newSuggestions = _.cloneDeep(this.state.suggestions)
        var updatedCategory = {
            categoryName: "Live Now",
            suggestions: sessions
        }
        newSuggestions = this.setCategory(newSuggestions, updatedCategory)
        this.setState({
            suggestions: newSuggestions,
            loading: false
        })
    }
    
    handleCreateSession = () => {
        this.props.axiosWrapper.axiosPost('/api/session/newSession', {
            name: `${this.props.user.username}'s Live Session`
        }, (function(res, data) {
			if (data.success) {
                this.props.handleUpdateUser(data.data.user)
                this.props.switchScreen(mainScreens.SESSION, data.data.sessionId)
			}
		}).bind(this), true)
    }

    handleGoToItem = (obj, e) => {
        if (obj.type === "session") {
            this.props.switchScreen(mainScreens.SESSION, obj._id)
        }
        else if (obj.type === "collection") {
            this.props.switchScreen(mainScreens.COLLECTION, obj._id)
        }
        else if (obj.type === "user") {
            this.props.switchScreen(mainScreens.PROFILE, obj._id)
        }
    }

    handleGoToItemCreator = (obj, e) => {
        if (obj.type === "session") {
            this.props.switchScreen(mainScreens.PROFILE, obj.hostId)
        }
        else if (obj.type === "collection") {
            this.props.switchScreen(mainScreens.PROFILE, obj.ownerId)
        }
    }

    handlePlayItem = (obj, e) => {
        if (obj.type === "song") {
            this.props.playVideo(obj._id)

            if (this.props.shouldStartSession()) {
                this.handleCreateSession()
            }
        }
        else if (obj.type === "session") {
            this.props.switchScreen(mainScreens.SESSION, obj._id)
        }
        else if (obj.type === "collection") {
            var songList = _.cloneDeep(obj.songList)
            if (songList.length > 0) {
                this.props.playVideo(songList.shift())

                Promise.all(songList.map((songId) => {
                    return this.props.fetchVideoById(songId, true)
                })).then((songs) => {
                    songs.forEach(song => this.props.queue.addSongToFutureQueue(song))
                }).then(() => {
                    if (this.props.shouldStartSession()) {
                        this.handleCreateSession()
                    }
                })
            }
        }
    }

    fetchSuggestions = () => {
        this.props.sessionManager.emitGetTopSessions()

        this.props.fetchMostPopular(15, true).then(res => {
            var newSuggestions = _.cloneDeep(this.state.suggestions)
            var updatedCategory = {
                categoryName: "Popular on YouTube",
                suggestions: res
            }
            newSuggestions = this.setCategory(newSuggestions, updatedCategory)
            this.setState({
                suggestions: newSuggestions,
                loading: false
            })
        })

        this.props.axiosWrapper.axiosGet('/api/home', (function(res, data) {
            if (data.success) {
                var newSuggestions = _.cloneDeep(this.state.suggestions)
                data.data.suggestions.forEach(category => {
                    newSuggestions = this.setCategory(newSuggestions, category)
                })
                Promise.all(newSuggestions.map(category => {
                    return new Promise((resolve, reject) => {
                        Promise.all(category.suggestions.map(obj => {
                            if (obj.type === "song") {
                                return this.props.fetchVideoById(obj._id, true)
                            }
                            return obj
                        })).then(suggestions => {
                            resolve({
                                categoryName: category.categoryName,
                                suggestions: suggestions
                            })
                        })
                    })
                })).then(suggestions => {
                    this.setState({
                        suggestions: suggestions,
                        loading: false
                    })
                })
            }
        }).bind(this), true)
    }

    getItemCreator = (obj) => {
        if (obj.type === "collection") {
            return obj.ownerName
        }
        else if (obj.type === "session") {
            return obj.hostName
        }
        return obj.creator
    }

    getItemName = (obj) => {
        if (obj.type === "user") {
            return obj.username
        }
        return obj.name
    }

    getItemImage = (obj) => {
        if (obj.type === "song") {
            return obj.image_high ? obj.image_high : obj.image_med ? obj.image_med : obj.image_std ? obj.image_std : obj.image ? obj.image : icon_music_1
        }
        else if (obj.type === "collection") {
            return obj.image ? obj.image : icon_playlist_2
        }
        else if (obj.type === "user" || obj.type === "session") {
            return obj.image ? obj.image : icon_profile_image
        }

        return obj.image 
    }

    setCategory = (suggestions, updatedCategory) => {
        var wasUpdated = suggestions.some(category => {
            if (category.categoryName === updatedCategory.categoryName) {
                category.suggestions = updatedCategory.suggestions
                return true
            }
        })

        if (wasUpdated) {
            return suggestions
        }

        suggestions.push(updatedCategory)
        return suggestions
    }

    render() {
        var component
        if (!this.state.loading) {
            component = 
                <div id="home-screen-container">
                    {this.state.suggestions.map((category, cat_ind) => category.suggestions?.length > 0 ?
                        <div className="home-screen-category-container" key={cat_ind}>
                            <div className="home-screen-category-name title color-contrasted">{category.categoryName}</div>
                            <CardDeck className="home-screen-category-list">
                                {
                                    category.suggestions.map((obj, item_ind) => 
                                        <Card className="home-screen-category-list-item" key={item_ind}>
                                            {(obj.type === "session" || obj.type === "user") && obj.live === true ? 
                                                    <Card.Text className="home-screen-category-list-item-live-indicator tiny-text color-accented">LIVE</Card.Text> :
                                                    <div></div>
                                            }
                                            <Card.Img className="home-screen-category-list-item-img" src={this.getItemImage(obj)}/>
                                            <Card.Footer className="home-screen-category-list-item-footer">
                                                <div className="subtitle">{this.getItemName(obj)}</div>
                                                <div className="body-text">{this.getItemCreator(obj)}</div>
                                            </Card.Footer>
                                        </Card>
                                        )
                                }
                            </CardDeck>
                        </div> :
                        <div key={cat_ind}></div>)
                    }
                </div>
        }
        else {
            component = <Spinner/>
        }
        
        
        return(
            <div className={this.props.visible ? "visible" : "hidden"}>
                {component}
            </div>
        );
    }
}

export default HomeScreen;
