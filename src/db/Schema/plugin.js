exports.paginationPlugin = function(schema, options) {
    options = options || {}
    
    schema.query.paginate = async function(params) {
        var limit = params.limit || options.limit || 10
        var page = params.page || 1

        await this.skip((page - 1) * limit)
        var data = await this.limit(limit)

        var totalCount = await this.model.countDocuments(this.getQuery())

        var hasNextPage = (totalCount - (page * limit)) > 0
        var hasPrevPage = page - 1 >= 1

        var nextPageToken = hasNextPage ? page + 1 : null
        var prevPageToken = hasPrevPage ? page - 1 : null

        return {
            result: data,
            nextPageToken: nextPageToken,
            prevPageToken: prevPageToken
        }
    }
}