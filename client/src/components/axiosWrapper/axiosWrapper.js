import axios from 'axios';


class AxiosWrapper {
	axiosGet(path, callback, withCredentials=false, errorCallback) {
		return axios.get(path, {
			withCredentials: withCredentials
		})
        .then(response => {
        	if(callback){
        		callback(response.status, response.data);
        	}
           
        })
        .catch(function (error){
            console.log(error);
            if(errorCallback){
                errorCallback();
            }
        });
	}
	axiosPost(path, payload, callback, withCredentials=false, headers={}) {
		return axios.post(path, payload, {
			headers: headers,
			withCredentials: withCredentials
		})
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

	


