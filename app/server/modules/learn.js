var cnMongoDB = require('../mongodb/connection'),
				ObjectID = cnMongoDB.ObjectID,
				fs = require("fs");
var MongoDb = require("mongodb");
var learnDB = cnMongoDB.learn;
var accountDB = cnMongoDB.account;
var https = require('https'); //Https module of Node.js
var FormData = require('form-data'); //Pretty multipart form maker.
var fql = require('fql');
//---------------------------------------------------------------
// CACH GET ACCESS_TOKEN CHO PAGE
// VAO APP -> EDIT SETTINGS -> CLICK VAO "Graph API Explorer"
// COPY ID CUA APPS, DAN LEN DUONG DAN VA RUN
// 534081833342710?fields=access_token
//---------------------------------------------------------------
//var ACCESS_TOKEN = "CAAICtp62IZBgBAHXmUJTZCDHfCdilbQz6XfZCKPe6j9E70NDyYYhKLsEZBSolZAF6MvZBtzff3WgBfIu4JSBu5iTZCZC3o3m9ZACvTodEZCQ7SNIZCG6PTZAWrBZBMCN7wj1wixbza8p9l51BTdEjv1Dau71zVHlijv0IYsUub47nF1FgWmmgYrzcWKZAdNZBP2ByZBrn6cZD";
var ACCESS_TOKEN = "CAAICtp62IZBgBAPdJ6Ohck0FhYsmiZCrOs2yZCN0Ai7JH1wNqnZC0tVfCOetqXCY60j3EfGadAK3cljdBgYQrI88qJYjuPz9J8z3tJYR9oOVzWoXfY6SL9akjwXZBwE6xhqA9csNQZCZA42BM7CLdQlD556Y6G5LIdbrLzvXRXhspE3PtVZB3LnZC";

//--------------------------------
// Function Add Image
// Param input: List input from screen
// Param image: image need to be upload
// Param callback: funtion callback
//--------------------------------
exports.addImage = function(input, image, callback){
	//--------------------------------
	// Define parameter
	//--------------------------------
	var tmp_path;		// Path of image in client
	var imgName;		// Image name after rename
	var target_path;	// Path of image in server
	var is,os;			// Input & output stream

	// Get the temporary location of the file
	tmp_path = image.path;

	// Set where the file should actually exists - in this case it is in the "images" directory
	imgName = new ObjectID() + image.name.substr(image.name.indexOf('.'),image.name.length);
	target_path =  './app/public/upload/' + imgName;

	// Move the file from the temporary location to the intended location
	is = fs.createReadStream(tmp_path);
	os = fs.createWriteStream(target_path);
	is.pipe(os);
	is.on('end',function() {
		fs.unlinkSync(tmp_path,function(err){
		});
	});

	// Return data image name to router
	callback(null,imgName);
}

//--------------------------------
// Function Add Location
// Param input: List input from screen
// Param callback: funtion callback
//--------------------------------
exports.addLearn = function(input, callback){
	if(input.learnid == ''){
		//-----------------------------------------
		// Define item insert to database
		//-----------------------------------------
		var iDate = new Date();
		var itemEntry = {	name_vn			: "",
							learncate		: 1,
							name_en			: "",
							image			: ""
						};
  
		itemEntry.name_vn			= input.name_vn;
		itemEntry.learncate 		= input.learncate;
		itemEntry.name_en 			= input.name_en;
		itemEntry.image 			= input.image;

		if (itemEntry._id) {
			itemEntry._id = new ObjectID(itemEntry._id);
		}

		learnDB.save(itemEntry, {safe: true}, callback);
	} else {
		learnDB.update( { _id : new ObjectID(input.learnid) }, 
							{ $set : { name_vn 		: input.name_vn,
									   learncate 	: input.learncate,
									   name_en		: input.name_en,
									   image		: input.image
							} }, function(err,result){
			if(err)
				callback(err,'Can not update user');
			else
				callback(null,result);
		});
	}
}

//--------------------------------
// Get list 365 food
// Param callback: funtion callback
//--------------------------------
exports.getAllLearnByCate = function(cateid, callback){
	learnDB.find({learncate : cateid}).sort([['name_en','asc']]).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get learn by id
// Param learnid: id of learn
// Param callback: funtion callback
//--------------------------------
exports.getLearnByID = function(learnid, callback){
	learnDB.findOne({_id:new ObjectID(learnid)}, function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get list learn
// Param page: curent page
// Param offset: offset setting
// Param callback: funtion callback
//--------------------------------
exports.getListLearn = function(learncate, page, offset, callback){
	var iSkip = (page - 1) * offset;
	var iOffset = page * offset;
	learnDB.find({  "learncate" : learncate }).sort([['_id','desc']]).skip(iSkip).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get count list learn
// Param callback: funtion callback
//--------------------------------
exports.getCountListLearn = function(learncate, callback){
	learnDB.count({  "learncate" : learncate }, function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Delete learn
// Param callback: funtion callback
//--------------------------------
exports.deleteLearn = function(learnid, callback){
	learnDB.remove({ _id : new ObjectID(learnid) }, function(err,result){
		if(err)
			callback(err,'Can not delete location');
		else
			callback(null,result);
	});
}
