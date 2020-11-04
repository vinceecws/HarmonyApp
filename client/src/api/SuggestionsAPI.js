class SuggestionsAPI {

    constructor() {
        this.url = 'https://clients1.google.com/complete/search?client=youtube&gs_ri=youtube&ds=yt&q='
    }

    query = (query, callback) => {
        var url = this.url + query
        var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
        window[callbackName] = function(data) {
            delete window[callbackName];
            document.body.removeChild(script);
            callback(data[1].map(item => item[0]));
        };
    
        var script = document.createElement('script');
        script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
        document.body.appendChild(script);
    }
}

export default SuggestionsAPI;