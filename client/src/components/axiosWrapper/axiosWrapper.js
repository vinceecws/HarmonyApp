import axios from 'axios';


class AxiosWrapper {
	axiosGet(path, callback, withCredentials=false) {
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
        });
	}
	axiosPost(path, payload, callback, withCredentials=false) {
		return axios.post(path, payload, {
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

	


