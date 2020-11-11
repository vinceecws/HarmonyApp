import React from 'react'
import sampleCollections from '../test/sampleCollections.json'
import {icon_music_1, icon_like, icon_play_2, icon_pause_3, icon_add_3} from '../graphics'
import { Image, Button } from 'react-bootstrap';


class CollectionScreen extends React.Component{
    constructor(props){
        super(props)
        this.user = null;
        //(AXIOS) this.collection = this.getCollection();
        this.collection = sampleCollections[1];
        this.state = {
            favoritedSongs: [false],
            playing: false,
            favorited: false,    //placeholder until function is written
            likedCollectoin: false
            //selected: this.props.currentScreen
        }
    }

    onPressLikeCollection = () =>{
        this.setState({favorited: !this.state.favorited});
    }

    onPressPlayQueue = () =>{
        this.setState({playing: !this.state.playing});
    }

    onPressLikeSong = (song) => {

    }

    onPressSongOptions = (song) => {

    }

    //Update later
    favoritedSong = (song) => {
        return this.state.favorited;
    }
    /*(AXIOS)
    getCollection = () => {
        var collectionReturn = false;
        var findCollection = function(status,data){
            if(status == 200){
                console.log(status);
                console.log(data);
                this.setState({
                    loading: false,
                    collectionReturn: data
                });
            }
        }
        this.props.axiosWrapper.axiosGet('/main/collection/:id', findCollection);
        return collectionReturn;
    }
    */

    render(){
        return (
            <div className='container' style={{minWidth: '100%'}}>
                
                {/* Header */}
                <div className='row' style={{backgroundColor: 'grey', border: '2px solid black', }}>
                    <div className='col' style={{maxWidth: '20%', paddingTop: '10px'}}>
                        <img src={icon_music_1} style={{maxHeight: '100px'}}></img>
                    </div>

                    {/* Collection Info */}
                    <div className='col' style={{marginRight: '30%', minWidth: '35%'}}>
                        <div className='row'>
                            <h2 className='collection-page-text'>
                                {this.collection.name}
                            </h2>
                        </div>
                        <div className='row'>
                            <p className='collection-page-text'>
                                {this.collection.description}
                            </p>
                        </div>
                        <div className='row'>
                            {/* Remember to add these attributes to collection objects*/}
                            <p className='collection-page-text'>
                                ChilledCow - {this.collection.likes} likes - 4 songs - 4 hr 10 min
                            </p>
                        </div>
                    </div>

                    {/* Queue Buttons */}
                    <div className='col'>
                        <div className='row'>
                            <Button className="player-control-button" onClick={this.onPressPlayQueue}>
                                <Image className="player-control-button-icon" src={this.state.playing ? icon_pause_3 : icon_play_2}  style={{minHeight: '40px', minWidth: '40px'}} roundedCircle/>
                            </Button>
                        </div>
                        <div className='row'>
                            <Button id='player-song-favorite-button' style={{position: 'relative'}} onClick={this.onPressLikeCollection}>
                                <Image className={this.state.favorited ? 'player-song-favorite-button-icon-on' : 'player-song-favorite-button-icon'} src={icon_like} 
                                        style={{minHeight: '40px', minWidth: '40px', marginTop: '20px'}} onClick={this.toggleFavorite} roundedCircle/>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Queue List */}
                
                <div className='row' style={{paddingTop: '5px', border: '2px solid black', backgroundColor: 'grey'}}>
                    <h5 className='collection-page-text' style={{marginLeft: '10px', marginRight: '30%'}}>Title</h5>
                    <h5 className='collection-page-text' style={{marginRight: '20%'}}>Artist</h5>
                    <h5 className='collection-page-text' style={{marginRight: '10%'}}>Date Added</h5>
                    <h5 className='collection-page-text' style={{marginRight: '10%'}}>Duration</h5>
                </div>

                {/* Songs */}
                <div className='row'>
                    <ul style={{listStyleType: 'none', padding: '0', border: '2px solid black'}}>
                    {this.collection.songList.map((e, i) => 
                        <li className="collection-page-rows" style={{minWidth: '90vw'}}>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <div id='player-song-title' style={{display: 'inline-block', marginLeft: '15px', marginRight: '2.5%', width: '27%'}}><div>{e.title}</div></div>
                                <div id='player-song-title' style={{display: 'inline-block', width: '20%', marginRight: '2%'}}><div>{e.artist}</div></div>
                                <div className='collection-page-text' style={{display: 'inline-block', marginRight: '10.5%'}}>10/30/2020</div>
                                <div className='collection-page-text' style={{display: 'inline-block', marginRight: '5%'}}>4:44</div>
                                <Button id='player-song-favorite-button' style={{position: 'relative', display: 'inline-block'}}>
                                    {/* Fix during implementation */}
                                    <Image className={this.state.favoritedSongs[0] ? 'player-song-favorite-button-icon-on' : 'player-song-favorite-button-icon'} src={icon_like} 
                                            style={{maxHeight: '25px', maxWidth: '25px'}} onClick={e => this.onPressLikeSong(e)} roundedCircle/>
                                </Button>
                                <Button id='player-song-favorite-button' style={{position: 'relative', display: 'inline-block'}}>
                                    <img src={icon_add_3} style={{maxHeight: '25px', maxWidth: '25px'}}></img>
                                </Button>
                            </div>
                        </li>)}
                    </ul>
                </div>
            </div>
        )
    }
}

export default CollectionScreen;