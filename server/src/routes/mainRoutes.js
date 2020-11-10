const User = require('../db/index.js')
const express = require("express")

mainRouter = express.Router()

mainRouter.route('/home').get(function(req, res) {
	User.find(function(err, users){
		if (err){
			console.log(err);
		} else {
			
			res.send("Obtained Users");
		}
	});
});

module.exports = mainRouter