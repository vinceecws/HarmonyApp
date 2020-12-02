class SuggestionsAPI {

    constructor() {
        this.url = 'https://clients1.google.com/complete/search?client=youtube&gs_ri=youtube&ds=yt&q='
    }

    query = (query, callback, limit=8) => {
        var url = this.url + query
        var callbackId = 'suggestions' + Math.round(100000 * Math.random())

        window[callbackId] = function(data) {
            delete window[callbackId]
            document.body.removeChild(script)
            callback(data[1].map(item => item[0]).slice(0, limit))
        }
    
        var script = document.createElement('script')
        script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackId
        document.body.appendChild(script)
    }
}

export default SuggestionsAPI;