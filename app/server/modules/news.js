var cnMongoDB = require('../mongodb/connection'),
				ObjectID = cnMongoDB.ObjectID,
				fs = require("fs");
var MongoDb = require("mongodb");
var newsDB = cnMongoDB.news;
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
		newsDB.update( { _id : new ObjectID(input.newsid) }, 
							{ $set : { title 			: input.title,
									   content 			: input.content,
									   categoryid		: input.category,
									   address			: input.categoryname,
									   subcategoryid	: input.subcategory,
									   subcategoryname	: input.subcategoryname
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

//--------------------------------
// Get list news
// Param page: curent page
// Param offset: offset setting
// Param callback: funtion callback
//--------------------------------
exports.getListNewsCH = function(subcategory, page, offset, callback){
	var iSkip = (page - 1) * offset;
	var iOffset = page * offset;
	newsDB.find({ $and: [{ categoryid: "1"} , { subcategoryid: subcategory.toString() }]}).sort([['_id','desc']]).skip(iSkip).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get count list news
// Param callback: funtion callback
//--------------------------------
exports.getCountListNewsCH = function(subcategory, callback){
	newsDB.count({ $and: [{ categoryid: "1"} , { subcategoryid: subcategory.toString() }]}, function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Delete news
// Param callback: funtion callback
//--------------------------------
exports.deleteNews = function(newsid, callback){
	newsDB.remove({ _id : new ObjectID(newsid) }, function(err,result){
		if(err)
			callback(err,'Can not delete location');
		else
			callback(null,result);
	});
}