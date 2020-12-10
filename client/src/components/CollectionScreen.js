import React from 'react'
import Spinner from './Spinner'
import {icon_music_1, icon_like, icon_play_2, icon_pause_3, icon_add_3, 
    icon_up_arrow, icon_down_arrow, menu_button_white, delete_button_white} from '../graphics'
import { Image, Button, Dropdown, ButtonGroup, Modal } from 'react-bootstrap';
import {Droppable, DragDropContext, Draggable} from 'react-beautiful-dnd'
import { mainScreens } from '../const'

const _ = require('lodash');


class CollectionScreen extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            collectionId: null,
            user: this.props.user,
            collection: null,
            songList: [],
            loading: true,
            showEditNameModal: false,
            showEditDescriptionModal: false,
            collectionName: '',
            collectionDescription: '',
            playing: false,
            favorited: false,
            songPlaying: null
        }
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (!_.isEqual(prevState.user, this.props.user)) {
            this.setState({
                user: this.props.user
            })
        }
        //If screen is active and new collectionId is passed
        if (this.props.screenProps && this.props.screenProps.collectionId && (prevState.collectionId !== this.props.screenProps.collectionId)) {
            this.setState({
                collectionId: this.props.screenProps.collectionId,
                loading: true
            }, this.fetchCollection)
        }
    }

    onPressLikeCollection = () =>{
        if (this.props.user !== null){
            let favoritedCollections = this.props.user.likedCollections;
            let numLikes = this.state.collection.likes;
            if (!this.state.favorited){
                numLikes++;
                this.props.user.likedCollections === undefined ? 
                            favoritedCollections = [this.state.collection._id] :
                            favoritedCollections.push(this.state.collection._id);
            }
            else if (this.props.user.likedCollections !== undefined){
                if (numLikes > 0){numLikes--;}
                favoritedCollections = [];
                for (let c of this.props.user.likedCollections){
                    if (c !== this.state.collectionId){
                        favoritedCollections.push(c);
                    }
                }
            }

            //update collection
            this.props.axiosWrapper.axiosPost('/api/collection/updateCollection/'+ this.state.collectionId,
            {likes: numLikes}, (function(res, data){
                if (data.success){
                    console.log('Updated collection');

                    //update user
                    this.props.axiosWrapper.axiosPost('/api/collection/updateUser/' + this.props.user._id,
                    {likedCollections: favoritedCollections}, (function(res, data){
                        if (data.success){
                            this.props.handleUpdateUser(data.data.user);
                            this.fetchCollection();
                        }
                    }).bind(this), true);
                }
            }).bind(this), true);

        }
    }

    onPressPlayQueue = () =>{
        if (this.state.songList.length > 0 && !this.state.playing){
            this.setState({playing: true});
            let futureQueue = this.state.collection.songList.slice(1);
            this.props.playVideo(this.state.collection.songList[0]);
            for (let s of futureQueue){
                this.props.dataAPI.fetchVideoById(s, true).then((song) => {
                    if (song.status === 403){
                        console.log('Youtube Query Quota Exceeded');
                    }
                    else{
                        this.props.queue.addSongToFutureQueue(song);
                    }  
                });
            }
        }
        else if (this.state.playing){
            this.setState({playing: false});
            this.props.playerAPI.pauseVideo();
        }
    }


    onEditName = () => {
        if (this.state.collectionName.trim() !== ''){
            this.props.axiosWrapper.axiosPost('/api/collection/updateCollection/' + this.state.collectionId, 
            {name: this.state.collectionName}, (function(res, data){
                if (data.success){
                    this.hideEditNameModal();
                    this.fetchCollection();
                }
            }).bind(this), true);
        }
    }

    onEditDescription = () => {
        if (this.state.collectionName.trim() !== ''){
            this.props.axiosWrapper.axiosPost('/api/collection/updateCollection/' + this.state.collectionId, 
            {description: this.state.collectionDescription}, (function(res, data){
                if (data.success){
                    this.hideEditDescriptionModal();
                    this.fetchCollection();
                }
            }).bind(this), true);
        }
    }

    onPressPlaySong = (song, index) => {
        let futureQueue = this.state.collection.songList.slice(index + 1);
        this.props.playVideo(song._id);
        for (let s of futureQueue){
            this.props.dataAPI.fetchVideoById(s, true).then((s) => {
                if (s.status === 403){
                    console.log('Youtube Query Quota Exceeded');
                }
                else{
                    this.props.queue.addSongToFutureQueue(s);
                    this.setState({playing: true, songPlaying: song._id});
                }  
            })
        }
    }

    onPressDeleteSong = (song) => {
        let newSongList = [];
        for (let s of this.state.collection.songList){
            if (s !== song._id){
                newSongList.push(s);
            }
        }
        this.props.axiosWrapper.axiosPost('/api/collection/updateCollection/' + this.state.collectionId, 
        {songList: newSongList}, (function(res, data){
            if (data.success){
                this.fetchCollection();
            }
            else{
                console.log("Error: could not delete")            
            }
        }).bind(this), true)
    }

    onPressLikeSong = (song) => {
        let favedSongs = this.props.user.likedSongs;
        if (song.favorited){
            song.favorited = false;
            favedSongs = [];
            for(let s of this.props.user.likedSongs){
                if (s !== song._id){
                    favedSongs.push(s);
                }
            }
        }
        else{
            song.favorited = true;
            if(favedSongs === undefined){
                favedSongs = [song._id];
            }
            else{
                favedSongs.push(song._id);
            }
        }
        
        this.props.axiosWrapper.axiosPost('/api/collection/updateUser/' + this.props.user._id, 
        {likedSongs: favedSongs}, (function(res, data){
            if(data.success){
                this.props.handleUpdateUser(data.data.user);
                this.fetchCollection();
            }
        }).bind(this), true)
    }

    fetchCollection = () => {
        if (this.state.collectionId) {
            this.props.axiosWrapper.axiosGet('/api/collection/' + this.state.collectionId, (function(res, data) {
                if (data.success) {

                    let songs = data.data.collection.songList;
                    if (songs){
                        Promise.all(songs.map((songId) => {
                            return this.props.dataAPI.fetchVideoById(songId, true)
                        })).then((s) => {
                            if (this.props.user && this.props.user.likedSongs.length > 0) {
                                for (let song of s) {
                                    let songFaved = false
                                    for (let fav of this.props.user.likedSongs) {
                                        if (fav === song._id) {
                                            songFaved = true
                                        }
                                    }
                                    song.favorited = songFaved
                                }
                            }
                            else {
                                for (let song of s){
                                    song.favorited = false;
                                }
                            }
                            this.setState({ 
                                collection: data.data.collection,
                                loading: false,
                                collectionName: data.data.collection.name,
                                favorited: this.isCollectionFavorited(data.data.collection),
                                songList: s
                            })
                        })
                    }
                }
            }).bind(this), true)
        }
    }

    getDurationString(duration){
        console.log('Duration: ', duration);
        //return String(duration / 60).padStart(2, '0') + ':' + String(duration % 60)
    }

    getDateAdded(date){
        return '10/30/2020'
    }

    sortByTitle = (e) =>{
        let sortedList = [];

    }

    sortByDateAdded = (e) =>{
        let sortedList = [];
    }

    sortByArtist = (e) => {
        let sortedList = [];
    }

    showEditNameModal = () => {
        this.setState({ showEditNameModal: true });
    }

    showEditDescriptionModal = () => {
        this.setState({ showEditDescriptionModal: true });
    }

    hideEditNameModal = () =>{
        this.setState({
            showEditNameModal: false,
            collectionName: this.state.collection.name
        });

    }

    hideEditDescriptionModal = () => {
        this.setState({
            showEditDescriptionModal: false,
            collectionDescription: this.state.collection.description
        });
    }    

    handleCollectionNameChange = (e) => {
        this.setState({ collectionName: e.target.value });
    }

    handleCollectionDescriptionChange = (e) => {
        this.setState({ collectionDescription: e.target.value });
    }

    isCollectionFavorited = (collection) => {
        if (this.props.user !== null && this.props.user.likedCollections !== undefined){
            for (let c of this.props.user.likedCollections){
                if (c === collection._id){
                    return true;
                }
            }
        } 
        return false;
    }


    onDeleteCollection = () => {
        this.props.axiosWrapper.axiosGet('/api/collection/delete/' + this.state.collectionId, (function(res, data){
            if (data.success){
                this.props.handleUpdateUser(data.data.user);
                this.props.switchScreen(mainScreens.PROFILE, {
                    userId: data.data.user._id
                })
            }
        }).bind(this), true)
    }

    //reorder songlist (persistant)
    handleOnDragEnd = (result) =>{
        console.log(result);
        if (result.destination !== null && result.source !== null){
            //update frontend
            /*
            let newStateSongList = _.cloneDeep(this.state.songList);
            let movedSong = newStateSongList[result.source];
            newStateSongList.splice(result.source.index, 1);
            newStateSongList.splice(result.destination.index, 0, movedSong);
            this.setState({songList: newStateSongList});
            */

            //update backend
            let newSongList = this.state.collection.songList;
            newSongList.splice(result.source.index, 1);
            newSongList.splice(result.destination.index, 0, result.draggableId);
            this.props.axiosWrapper.axiosPost('/api/collection/updateCollection/' + this.state.collectionId, 
            {songList: newSongList}, (function(res, data){
                if(data.success){
                    this.fetchCollection();
                }
            }).bind(this), true)
        }
    }


    ownsCollection = () => {
        if (this.props.user){
            for (let playlist of this.props.user.playlists){
                if (String(playlist) === this.state.collection._id){
                    return true;
                }
            }
        }
        return false;
    }

    render(){
        var component
        if (this.state.loading) {
            component = <Spinner/>
        }
        else {
            component = (
                <div className='container' style={{minWidth: '100%'}}>
                    <Modal show={this.state.showEditNameModal}>
						<Modal.Header onHide={this.hideEditNameModal} closeButton>
							<Modal.Title>Change Collection Name</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<p>Collection Name:</p>
							<input value={this.state.collectionName} onChange={this.handleCollectionNameChange}></input>
						</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={this.hideEditNameModal}>Close</Button>
							<Button variant="primary" onClick={this.onEditName}>Edit</Button>
						</Modal.Footer>
					</Modal>
                    
                    <Modal show={this.state.showEditDescriptionModal}>
						<Modal.Header onHide={this.hideEditDescriptionModal} closeButton>
							<Modal.Title>Change Collection Description</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<p>Collection Description:</p>
							<input value={this.state.collectionDescription} onChange={this.handleCollectionDescriptionChange}></input>
						</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={this.hideEditDescriptionModal}>Close</Button>
							<Button variant="primary" onClick={this.onEditDescription}>Edit</Button>
						</Modal.Footer>
					</Modal>


                    {/* Header */}
                    <div className='row' style={{backgroundColor: 'grey', border: '2px solid black', }}>
                        <div className='col' style={{maxWidth: '20%', paddingTop: '10px', paddingBottom: '10px'}}>
                            <img src={icon_music_1} style={{maxHeight: '100px'}}></img>
                        </div>

                        {/* Collection Info */}
                        <div className='col' style={{marginRight: '30%', minWidth: '35%'}}>
                            <div className='row'>
                                <h2 className='collection-page-text'>
                                    {this.state.collection.name}
                                </h2>
                            </div>
                            <div className='row'>
                                <p className='collection-page-text'>
                                    {this.state.collection.description}
                                </p>
                            </div>
                            <div className='row'>
                                {/* Remember to add these attributes to collection objects*/}
                                <p className='collection-page-text'>
                                    {this.state.collection.ownerName} - {this.state.collection.likes} likes - {this.state.collection.songList.length} songs 
                                </p>
                            </div>
                        </div>

                        {/* Queue Buttons */}
                        <div className='col'>
                            {this.ownsCollection() ?
                            <div className='row'>
                                <Dropdown className="search-screen-results-category-list-item-img-overlay-dropdown" as={ButtonGroup}>
                                    <Dropdown.Toggle split className="search-screen-results-category-list-item-img-overlay-dropdown-button no-caret">
                                        <Image className="search-screen-results-category-list-item-img-overlay-dropdown-button-icon" src={menu_button_white} />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className="search-screen-results-category-list-item-img-overlay-dropdown-menu">
                                        <Dropdown.Item>
                                            <Button onClick={this.showEditNameModal}>
                                                Edit Name
                                            </Button>
                                        </Dropdown.Item>
                                        <Dropdown.Item>
                                            <Button onClick={this.showEditDescriptionModal}>
                                                Edit Description
                                            </Button>
                                        </Dropdown.Item>
                                        <Dropdown.Item>
                                            <Button onClick={this.onDeleteCollection}>
                                                Delete Collection
                                            </Button>
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown> 
                            </div>
                            : <div></div>
                        }
                        {this.props.user ? 
                            <div className='row'>
                                <Button id='player-song-favorite-button' style={{position: 'relative',  paddingTop: '5%'}}>
                                    <Image className={'player-song-favorite-button-icon'} onClick={this.onPressLikeCollection} src={icon_like} 
                                            style={{minHeight: '40px', minWidth: '40px', marginTop: '20px', backgroundColor: this.state.favorited ? '#00e400' : 'transparent'}} roundedCircle/>
                                </Button>
                            </div>
                            : <div></div>
                        }  
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
                        <DragDropContext onDragEnd={this.handleOnDragEnd} style={{minWidth: '100%'}}> 
                            <Droppable droppableId={this.state.collection.name}>        
                                {(provided) =>                 
                                (<ul style={{listStyleType: 'none', padding: '0', border: '2px solid black', minWidth: '100%'}} {...provided.droppableProps} ref={provided.innerRef}>
                                {this.state.songList.length > 0 ? 
                                (this.state.songList.map((e, i) => 
                                    (<Draggable key={e._id} draggableId={e._id} index={i} style={{minWidth: '100%'}}>
                                        {(provided) => 
                                        (<li className="collection-page-rows" style={{minWidth: '90vw'}} {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                                            <div style={{display: 'flex', alignItems: 'center'}}>
                                                <div className='collection-song-title ellipsis-multi-line-overflow'  style={{display: 'inline-block', marginLeft: '15px', marginRight: '2.5%', width: '27%'}} onClick={() => this.onPressPlaySong(e, i)}>{e.name}</div>
                                                <div className='collection-song-title ellipsis-multi-line-overflow' style={{display: 'inline-block', width: '20%', marginRight: '2%'}}><div>{e.creator}</div></div>
                                                <div className='collection-page-text' style={{display: 'inline-block', marginRight: '10.5%'}}>{this.getDateAdded()}</div>
                                                <div className='collection-page-text' style={{display: 'inline-block', marginRight: '5%'}}>{this.getDurationString(e.duration, i)} </div>
                                                { this.props.user ? 
                                                    <Button id='player-song-favorite-button' style={{position: 'relative', display: 'inline-block'}}>
                                                        {/* Fix during implementation */}
                                                        <Image className='player-song-favorite-button-icon' src={icon_like} 
                                                                style={{maxHeight: '25px', maxWidth: '25px', backgroundColor: e.favorited ? '#00e400' : 'transparent'}} 
                                                                onClick={() => this.onPressLikeSong(e)} roundedCircle/>
                                                    </Button>
                                                    : <div></div>
                                                }
                                                { this.ownsCollection() ? 
                                                <Button id='player-song-favorite-button' style={{position: 'relative', display: 'inline-block'}} 
                                                        onClick={() => this.onPressDeleteSong(e)}>
                                                    <img src={delete_button_white} style={{maxHeight: '25px', maxWidth: '25px'}}></img>
                                                </Button>
                                                : <div></div>
                                                }
                                            </div>
                                        </li>)}
                                    </Draggable>)
                                    )
                                ) : <div></div>}
                                {provided.placeholder}
                                </ul>)}
                            </Droppable>
                        </DragDropContext>
                    </div>
                </div>
            )
        }
        return (
            <div className={this.props.visible ? "visible" : "hidden"}>
                {component}
            </div>
        )
    }
}

export default CollectionScreen;