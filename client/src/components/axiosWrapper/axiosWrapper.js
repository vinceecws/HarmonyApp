import React from 'react';
import axios from 'axios';



export function axiosGet(path, callback){
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
export function axiosPost(path, payload, callback){
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
	


