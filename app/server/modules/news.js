var cnMongoDB = require('../mongodb/connection'),
				ObjectID = cnMongoDB.ObjectID,
				fs = require("fs");
var MongoDb = require("mongodb");
var newsDB = cnMongoDB.news;
var accountDB = cnMongoDB.account;
var https = require('https'); //Https module of Node.js
var FormData = require('form-data'); //Pretty multipart form maker.
//---------------------------------------------------------------
// CACH GET ACCESS_TOKEN CHO PAGE
// VAO APP -> EDIT SETTINGS -> CLICK VAO "Graph API Explorer"
// COPY ID CUA APPS, DAN LEN DUONG DAN VA RUN
//---------------------------------------------------------------
var ACCESS_TOKEN = "CAAICtp62IZBgBAHXmUJTZCDHfCdilbQz6XfZCKPe6j9E70NDyYYhKLsEZBSolZAF6MvZBtzff3WgBfIu4JSBu5iTZCZC3o3m9ZACvTodEZCQ7SNIZCG6PTZAWrBZBMCN7wj1wixbza8p9l51BTdEjv1Dau71zVHlijv0IYsUub47nF1FgWmmgYrzcWKZAdNZBP2ByZBrn6cZD";

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
exports.addNews = function(input, callback){
	if(input.newsid == ''){
		//-----------------------------------------
		// Define item insert to database
		//-----------------------------------------
		var iDate = new Date();
		var itemEntry = {	title			: "",
							content			: "",
							categoryid		: 10,
							categoryname	: "",
							subcategoryid	: 101,
							subcategoryname	: "",
							faceid			: "",
							like			: 10,
							add				: 100,
							share			: 20,
							image			: "",
							adddatetime		: iDate
						};
  
		itemEntry.title				= input.title;
		itemEntry.content 			= input.content;
		itemEntry.categoryid 		= input.category;
		itemEntry.categoryname 		= input.categoryname;
		itemEntry.subcategoryid 	= input.subcategory;
		itemEntry.subcategoryname 	= input.subcategoryname;
		itemEntry.like 				= 0;
		itemEntry.add 				= 0;
		itemEntry.share 			= 0;
		itemEntry.image 			= input.image;

		if (itemEntry._id) {
			itemEntry._id = new ObjectID(itemEntry._id);
		}

		//-----------------------------------------
		// Post to facebook
		//-----------------------------------------
		var form = new FormData(); //Create multipart form
		var imageName = itemEntry.image.substr(itemEntry.image.indexOf('/upload/') + 8,itemEntry.image.length);
		form.append('file', fs.createReadStream('./app/public/upload/'+ imageName)); //Put file
		form.append('message', itemEntry.content); //Put message
		 
		//POST request options, notice 'path' has access_token parameter
		var options = {
			method: 'post',
			host: 'graph.facebook.com',
			path: '/534081833342710/photos?access_token=' + ACCESS_TOKEN,
			headers: form.getHeaders(),
		}

		//Do POST request, callback for response
		var request = https.request(options, function (response){
			//console.log('STATUS: ' + response.statusCode);
			//console.log('HEADERS: ' + JSON.stringify(response.headers));
			response.setEncoding('utf8');

			response.on('data', function(chunk) {
				itemEntry.faceid = (JSON.parse(chunk)).id;
				console.log(itemEntry.faceid);
			});

			response.on('end', function() {
				newsDB.save(itemEntry, {safe: true}, callback);
			});

		});
		 
		//Binds form to request
		form.pipe(request);

		//If anything goes wrong (request-wise not FB)
		request.on('error', function (error) {
			callback(error,null);
		});
	} else {
		newsDB.update( { _id : new ObjectID(input.locationid) }, 
							{ $set : { namelocation : input.title,
									   country 		: input.content,
									   city			: input.category,
									   address		: input.categoryname,
									   description	: input.subcategoryid,
									   image		: input.subcategoryname
							} }, function(err,result){
			if(err)
				callback(err,'Can not update user');
			else
				callback(null,result);
		});
	}
}

//--------------------------------
// Get list news by subcategory
// Param subcate: id of subcategory
// Param callback: funtion callback
//--------------------------------
exports.getNewsBySub = function(subcate, callback){
	newsDB.find({ "subcategoryid" : subcate }).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get news by id
// Param newsid: id of news
// Param callback: funtion callback
//--------------------------------
exports.getNewsByID = function(newsid, callback){
	newsDB.findOne({_id:new ObjectID(newsid)}, function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Update like, share of news
// Param newsid: id of news
// Param callback: funtion callback
//--------------------------------
exports.updateLikeShare = function(newsid, like, share, add, callback){
	newsDB.update({ _id : new ObjectID(newsid) }, 
				  { $set : { like 	 : Number(like),
							 share	 : Number(share),
							 add	 : Number(add)
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
	newsDB.aggregate( [
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
/*
//--------------------------------
// Get list recommend location
// Param userid: current user
// Param callback: funtion callback
//--------------------------------
exports.getRecommendLocation = function(userid,callback){
	locationDB.find({"isrecommend":"true"}).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get list location by distance
// Param distance: distance to location
// Param callback: funtion callback
//--------------------------------
exports.getLocationByDistance = function(idistance, lon, lat, callback){
	var distance 	= parseFloat(idistance/1000);
	var limit  		= 99;
	var skip		= 0;
	locationDB.find({coordinate: {$within: {$center:[[parseFloat(lon),parseFloat(lat)],distance]}}})
					.limit(limit)
					.skip(skip)
					.toArray(function(err, results) {
						if(results){
							callback(null, results);
						} else {
							callback(err,null);
						}
					});
}

//--------------------------------
// Get list location with country, city
// Param userid: current user
// Param country: country of location
// Param city: city of location
// Param callback: funtion callback
//--------------------------------
exports.getLocationByAddress = function(userid, country, city, callback){
	locationDB.find({"country":country,"city":city}).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get location info
// Param locationid: id of location
// Param callback: funtion callback
//--------------------------------
exports.getLocation = function(locationid, callback){
	locationDB.findOne({_id:new ObjectID(locationid)}, function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Add number comment for location
// Param locationid: id of location
// Param callback: funtion callback
//--------------------------------
exports.addLocationComment = function(locationid, callback){
	locationDB.update({_id:new ObjectID(locationid)}, {$inc:{'comment':1}}, function(err,result){
		if(err)
			callback(err,'Can not add comment');
		else
			callback(null,result);
	});
}

//--------------------------------
// Add number like for location
// Param locationid: id of location
// Param callback: funtion callback
//--------------------------------
exports.addLocationLike = function(locationid, callback){
	locationDB.update({_id:new ObjectID(locationid)}, {$inc:{'like':1}}, function(err,result){
		if(err)
			callback(err,'Can not add like');
		else
			callback(null,result);
	});
}

//--------------------------------
// Update number comment for location
// Param locationid: id of location
// Param cmt: number comment
// Param callback: funtion callback
//--------------------------------
exports.updateLocationComment = function(locationid, cmt, callback){
	locationDB.update({ _id : new ObjectID(locationid) }, { $set : { comment : Number(cmt) } }, function(err,result){
		if(err)
			callback(err,'Can not update comment');
		else
			callback(null,result);
	});
}

//--------------------------------
// Update number like for location
// Param nlike: number like
// Param callback: funtion callback
//--------------------------------
exports.updateLocationLike = function(locationid, nlike, callback){
	locationDB.update({ _id : new ObjectID(locationid) }, { $set : { like : Number(nlike) } }, function(err,result){
		if(err)
			callback(err,'Can not update like');
		else
			callback(null,result);
	});
}

//--------------------------------
// Delete location
// Param nlike: number like
// Param callback: funtion callback
//--------------------------------
exports.deleteLocation = function(locationid, callback){
	locationDB.remove({ _id : new ObjectID(locationid) }, function(err,result){
		if(err)
			callback(err,'Can not delete location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Update number like and comment for location
// Param nlike: number like
// Param ncomment: number comment
// Param callback: funtion callback
//--------------------------------
exports.updateLocationLikeComment = function(locationid, nlike, ncomment, callback){
	locationDB.update({ _id : new ObjectID(locationid) }, 
					  { $set : { like : Number(nlike), comment : Number(ncomment) } }, function(err,result){
		if(err)
			callback(err,'Can not update');
		else
			callback(null,result);
	});
}


//--------------------------------
// Add user checkin
// Param userid: user checkin
// Param callback: funtion callback
//--------------------------------
exports.checkinLocation = function(userid, locationid, callback){
	locationDB.update( { _id : new ObjectID(locationid) },{ $push: { checkin : userid } }, function(err,resultUpdate){
		if(err){
			callback(err,'Can not add user checkin');
		} else {
			locationDB.findOne({_id:new ObjectID(locationid)}, function(err,resultFind){
				if(err) {
					callback(err,'Can not get location');
				} else {
					accountDB.update( { 'userid' : userid }, { $set : { lastcheckinid : resultFind._id,
																		lastcheckinname : resultFind.namelocation } }, function(err,result){
						if(err)
							callback(err,'Can not update user');
						else
							callback(null,result);
					});
				}
			});
		}
	});
}

//--------------------------------
// Get checkin location
// Param userid: user checkin
// Param callback: funtion callback
//--------------------------------
exports.getCheckinLocation = function(userid,page,offset,callback){
	var iSkip = (page - 1)* offset;
	var iOffset = page * offset;
	locationDB.find( { checkin: userid } ).skip(iSkip).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list image');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get list  location
// Param userid: current user
// Param callback: funtion callback
//--------------------------------
exports.getListLocation = function(page,offset,callback){
	var iSkip = (page - 1)* offset;
	var iOffset = page * offset;
	locationDB.find({}).sort([['_id','desc']]).skip(iSkip).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Delete  location
// Param locationid: id of location
// Param callback: funtion callback
//--------------------------------
exports.deleteLocation = function(locationid, callback){
	locationDB.remove( { _id : new ObjectID(locationid) }, function(err,result){
		if(err)
			callback(err,'Can not delete user');
		else
			callback(null,result);
	});
}
*/