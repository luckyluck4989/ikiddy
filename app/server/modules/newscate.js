var cnMongoDB = require('../mongodb/connection'),
				ObjectID = cnMongoDB.ObjectID,
				fs = require("fs");
var MongoDb = require("mongodb");
var newscateDB = cnMongoDB.subcategory;
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
//var ACCESS_TOKEN = "CAAICtp62IZBgBAPdJ6Ohck0FhYsmiZCrOs2yZCN0Ai7JH1wNqnZC0tVfCOetqXCY60j3EfGadAK3cljdBgYQrI88qJYjuPz9J8z3tJYR9oOVzWoXfY6SL9akjwXZBwE6xhqA9csNQZCZA42BM7CLdQlD556Y6G5LIdbrLzvXRXhspE3PtVZB3LnZC";
var ACCESS_TOKEN = "CAAU2z6oZAQHABAE84ZA0LzVo0BuRdbAFZBgMRwGwZAcEcEz5kqsBsdw2ovc0mZBRGkNKab7DL6WbF3zaYbeP81xL86vpOQpZAuDpwldNZAnAnZA77eZC5u73nCGbHGNrqsxsz6uRHvNb44eeZC1ZC0ZCXNBcrJHgkLlKf1WjsGkc5VnAcN0qZC1JXRSp0";

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
							adddatetime		: iDate
						};
  
		itemEntry.name				= input.name;
		itemEntry.image 			= input.image;

		if (itemEntry._id) {
			itemEntry._id = new ObjectID(itemEntry._id);
		}

		newscateDB.save(itemEntry, {safe: true}, callback);
	} else {
		newscateDB.update( { _id : new ObjectID(input.itemid) }, 
							{ $set : { subcategoryname	: input.name,
									   image			: input.image
							} }, function(err,result){
			if(err)
				callback(err,'Can not update user');
			else
				callback(null,result);
		});
	}
}

//--------------------------------
// Get list vide category
// Param callback: funtion callback
//--------------------------------
exports.getAllNewsCate = function(callback){
	newscateDB.find().sort([['name','asc']]).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get news by id
// Param cateid: id of news
// Param callback: funtion callback
//--------------------------------
exports.getNewsCategoryByID = function(cateid, callback){
	newscateDB.findOne({_id:new ObjectID(cateid)}, function(err,result){
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
// Get list news category
// Param page: curent page
// Param offset: offset setting
// Param callback: funtion callback
//--------------------------------
exports.getListNewsCate = function(page, offset, callback){
	var iSkip = (page - 1) * offset;
	var iOffset = page * offset;
	newscateDB.find().sort([['name','asc']]).skip(iSkip).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get count list news category
// Param callback: funtion callback
//--------------------------------
exports.getCountNewsCate = function(callback){
	newscateDB.count({}, function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Delete news cate
// Param callback: funtion callback
//--------------------------------
exports.deleteNewsCate = function(idcate, callback){
	newscateDB.remove({ _id : new ObjectID(idcate) }, function(err,result){
		if(err)
			callback(err,'Can not delete food');
		else
			callback(null,result);
	});
}