import React from 'react'
import Spinner from './Spinner'
import {icon_music_1, icon_like, icon_play_2, icon_pause_3, icon_add_3, 
    icon_up_arrow, icon_down_arrow, menu_button_white, delete_button_white} from '../graphics'
import { Image, Button, Dropdown, ButtonGroup, Modal } from 'react-bootstrap';
import {Droppable, DragDropContext, Draggable} from 'react-beautiful-dnd'


class CollectionScreen extends React.Component{
    constructor(props){
        super(props)
        this.state = {
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
            favoritedSong: false
        }
    }

    componentDidMount = () => {
        console.log('CollectionScreen Mounted')
        this.fetchCollection();
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevState.user !== this.props.user) {
            this.setState({
                user: this.props.user
            })
        }
    }

    onPressLikeCollection = () =>{
        if (this.state.user !== null){
            let favoritedCollections = this.state.user.likedCollections;
            if (!this.state.favorited){
                this.state.user.likedCollections === undefined ? 
                            favoritedCollections = [this.state.collection._id] :
                            favoritedCollections.push(this.state.collection._id);
            }
            else if (this.state.user.likedCollections !== undefined){
                favoritedCollections = [];
                for (let c of this.state.user.likedCollections){
                    if (c !== this.props.match.params.collectionId){
                        favoritedCollections.push(c);
                    }
                }
            }
            console.log('Sending Payload: ', favoritedCollections);
            
            this.props.axiosWrapper.axiosPost('/api/collection/updateUser/' + this.state.user._id,
            {likedCollections: favoritedCollections}, (function(res, data){
                if (data.success){
                    console.log('Updated user: ', favoritedCollections);
                    this.props.handleUpdateUser(data.data.user);
                    this.setState({
                        favorited: !this.state.favorited});
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
        console.log("EDIT NAME")
        if (this.state.collectionName.trim() !== ''){
            this.props.axiosWrapper.axiosPost('/api/collection/updateCollection/' + this.props.match.params.collectionId, 
            {name: this.state.collectionName}, (function(res, data){
                if (data.success){
                    console.log('Editing Name Success')
                    this.hideEditNameModal();
                    this.fetchCollection();
                }
            }).bind(this), true);
        }
    }

    onEditDescription = () => {
        console.log("EDIT DESCRIPTION")
        if (this.state.collectionName.trim() !== ''){
            this.props.axiosWrapper.axiosPost('/api/collection/updateCollection/' + this.props.match.params.collectionId, 
            {description: this.state.collectionDescription}, (function(res, data){
                if (data.success){
                    this.hideEditDescriptionModal();
                    this.fetchCollection();
                }
            }).bind(this), true);
        }
    }

    onPressPlaySong = (song_ind) => {
        let futureQueue = this.state.collection.songList.slice(song_ind + 1);
        this.props.playVideo(this.state.collection.songList[song_ind]);
        for (let s of futureQueue){
            this.props.dataAPI.fetchVideoById(s, true).then((song) => {
                if (song.status === 403){
                    console.log('Youtube Query Quota Exceeded');
                }
                else{
                    this.props.queue.addSongToFutureQueue(song);
                }  
            })
            
        }
    }

    onPressDeleteSong = (song) => {
        console.log("DELETE SONG")
        let newSongList = [];
        for (let s of this.state.collection.songList){
            if (s !== song._id){
                newSongList.push(s);
            }
        }
        this.props.axiosWrapper.axiosPost('/api/collection/updateCollection/' + this.props.match.params.collectionId, 
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
        this.setState({favoritedSong: !this.state.favoritedSong});
        let favedSongs = this.state.user.likedSongs;
        if(favedSongs === undefined){
            favedSongs = [song.id];
        }
        else{
            favedSongs.push(song.id);
        }
        this.props.axiosWrapper.axiosPost('/api/collection/updateUser/' + this.state.user._id, 
        {likedSongs: favedSongs}, (function(res, data){
            if(data.success){
                this.props.handeUpdateUser(data.data.user);
                console.log('Updated favorited songs: ', data.data.user.likedSongs)
            }
        }).bind(this), true)
    }

    //Update later
    favoritedSong = (song) => {
        return this.state.favorited;
    }

<<<<<<< HEAD

=======
>>>>>>> 3bf263adab4b8b456139d9ebdf8dbb89f7bd3fae
    fetchCollection = () => {
        console.log("FETCH COLLECTION")
        if (this.props.match.params.collectionId) {
            this.props.axiosWrapper.axiosGet('/api/collection/' + this.props.match.params.collectionId, (function(res, data) {
                if (data.success) {

                    let songs = data.data.collection.songList;
                    if (songs){
                        Promise.all(songs.map((songId) => {
                            return this.props.dataAPI.fetchVideoById(songId, true)
                        })).then((s) => {
                            if (this.state.user.likedSongs) {
                                for (let song of s) {
                                    let songFaved = false
                                    for (let fav of this.state.user.likedSongs) {
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
        return String(duration / 60).padStart(2, '0') + ':' + String(duration % 60)
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
        if (this.state.user !== null && this.state.user.likedCollections !== undefined){
            for (let c of this.state.user.likedCollections){
                if (c === collection._id){
                    return true;
                }
            }
        } 
    }

    render(){
        console.log(this.state.songList)
        if (this.state.loading) {
            return <Spinner/>
        }
        else {
            return (
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
                        <div className='col' style={{maxWidth: '20%', paddingTop: '10px'}}>
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
                                    {this.state.user.username} - {this.state.collection.likes} likes - {this.state.collection.songList.length} songs 
                                </p>
                            </div>
                        </div>

                        {/* Queue Buttons */}
                        <div className='col'>
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
                                    </Dropdown.Menu>
                                </Dropdown>
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
                        <DragDropContext onDragEnd={() => {}}> 
                        <ul style={{listStyleType: 'none', padding: '0', border: '2px solid black'}}>
                        {this.state.songList.length > 0 ? 
                        (this.state.songList.map((e, i) => 
                            <li className="collection-page-rows" style={{minWidth: '90vw'}}>
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <div id='player-song-title' style={{display: 'inline-block', marginLeft: '15px', marginRight: '2.5%', width: '27%'}}><div>{e.name}</div></div>
                                    <div id='player-song-title' style={{display: 'inline-block', width: '20%', marginRight: '2%'}}><div>{e.creator}</div></div>
                                    <div className='collection-page-text' style={{display: 'inline-block', marginRight: '10.5%'}}>{d => this.getDateAdded(d)}</div>
                                    <div className='collection-page-text' style={{display: 'inline-block', marginRight: '5%'}}>{d => this.getDurationString(d)} </div>
                                    <Button id='player-song-favorite-button' style={{position: 'relative', display: 'inline-block'}}>
                                        {/* Fix during implementation */}
                                        <Image className='player-song-favorite-button-icon' src={icon_like} 
                                                style={{maxHeight: '25px', maxWidth: '25px'}} onClick={() => this.onPressLikeSong(e)} roundedCircle/>
                                    </Button>
                                    <Button id='player-song-favorite-button' style={{position: 'relative', display: 'inline-block'}} 
                                            onClick={() => this.onPressDeleteSong(e)}>
                                        <img src={delete_button_white} style={{maxHeight: '25px', maxWidth: '25px'}}></img>
                                    </Button>
                                </div>
                            </li>)) : <div></div>
                        }
                        </ul>
                        </DragDropContext>
                    </div>
                </div>
            )
        }
    }
}

export default CollectionScreen;