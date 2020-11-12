import axios from 'axios';


class AxiosWrapper {
	axiosGet(path, callback) {
		return axios.get(path)
        .then(response => {
        	if(callback){
        		callback(response.status, response.data);
        	}
           
        })
        .catch(function (error){
            console.log(error);
        });
	}
	axiosPost(path, payload, callback) {
		return axios.post(path, payload)
        .then(response => {
        	if(callback){
        		callback(response.status, response.data)
        	}
            
        })
        .catch(function (error){
            console.log(error);
        });
	}
}

export default AxiosWrapper;

	


