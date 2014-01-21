var cnMongoDB = require('../mongodb/connection'),
				ObjectID = cnMongoDB.ObjectID,
				fs = require("fs");
var MongoDb = require("mongodb");
var videoDB = cnMongoDB.video;
var videocateDB = cnMongoDB.videocate;
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
exports.addItem = function(input, callback){
	if(input.itemid == ''){
		//-----------------------------------------
		// Define item insert to database
		//-----------------------------------------
		var iDate = new Date();
		var itemEntry = {	name			: "",
							image			: "",
							videocate		: "",
							clip			: "",
							down			: 0,
							like			: 0,
							share			: 0,
							adddatetime		: iDate
						};
  
		itemEntry.name				= input.name;
		itemEntry.image 			= input.image;
		itemEntry.clip 				= input.clip;
		itemEntry.videocate 		= input.videocate;

		if (itemEntry._id) {
			itemEntry._id = new ObjectID(itemEntry._id);
		}

		videoDB.save(itemEntry, {safe: true}, callback);
	} else {
		videoDB.update( { _id : new ObjectID(input.itemid) }, 
							{ $set : { name 		: input.name,
									   image		: input.image,
									   clip			: input.clip,
									   videocate	: input.videocate
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
exports.getAll365Food = function(callback){
	videoDB.find().sort([['name','asc']]).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get video by id
// Param videoid: id of video
// Param callback: funtion callback
//--------------------------------
exports.getVideoByID = function(videoid, callback){
	videoDB.findOne({_id:new ObjectID(videoid)}, function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Update like, share of food
// Param foodid: id of food
// Param callback: funtion callback
//--------------------------------
exports.updateLikeShare = function(foodid, like, share, callback){
	foodDB.update({ _id : new ObjectID(foodid) }, 
				  { $set : { like 	 : Number(like),
							 share	 : Number(share)
						   } 
				  },
				  function(err,result){
		if(err)
			callback(err,'Can not update comment');
		else
			callback(null,result);
	});
}

//--------------------------------
// Count category
// Param callback: funtion callback
//--------------------------------
exports.getTotalNewsInfo = function(code, callback){
	foodDB.aggregate( [
		{ $match: { categoryid	: code  } },
		{ $group: { _id			: "$subcategoryid",
					sum_like	: { $sum: "$like" },
					sum_share	: { $sum: "$share" }, 
					sum_add		: { $sum: "$add" } 
				  } 
		},
		{ $sort: { _id: 1 } }
	], function(err,resultSystem){
		if(err){
			callback(err,'Can not add log history');
		} else {
			callback(null,resultSystem);
		}
	});
}

//--------------------------------
// Get list video
// Param page: curent page
// Param offset: offset setting
// Param callback: funtion callback
//--------------------------------
exports.getListVideo = function(page, offset, callback){
	var iSkip = (page - 1) * offset;
	var iOffset = page * offset;
	videoDB.find().sort([['name','asc']]).skip(iSkip).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else {
			videocateDB.find().sort([['name','asc']]).toArray(function(err,videoCateJson){
				if(err)
					callback(err,'Can not get list location');
				else {
					for(var i = 0; i < videoCateJson.length; i++){
						for( var j = 0; j < result.length; j++){
							if(result[j].videocate == videoCateJson[i]._id)
								result[j].videocate = videoCateJson[i].name;
						}
					}
					callback(null,result);
				}
			});
		}
	});
}

//--------------------------------
// Get count list video
// Param callback: funtion callback
//--------------------------------
exports.getCountListVideo = function(callback){
	videoDB.count({}, function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Delete video cate
// Param callback: funtion callback
//--------------------------------
exports.deleteVideo = function(videoid, callback){
	videoDB.remove({ _id : new ObjectID(videoid) }, function(err,result){
		if(err)
			callback(err,'Can not delete food');
		else
			callback(null,result);
	});
}