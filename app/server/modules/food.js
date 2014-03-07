var cnMongoDB = require('../mongodb/connection'),
				ObjectID = cnMongoDB.ObjectID,
				fs = require("fs");
var MongoDb = require("mongodb");
var foodDB = cnMongoDB.food;
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
							materials		: "",
							method			: "",
							image			: "",
							like			: 10,
							share			: 10,
							faceid			: "",
							adddatetime		: iDate,
							meals			: "",
							namemeals		: "",
							cook			: "",
							age				: "",
							mainmaterial	: "",
							description		: ""
						};
  
		itemEntry.name				= input.name;
		itemEntry.materials 		= input.material;
		itemEntry.method 			= input.method;
		itemEntry.like 				= 0;
		itemEntry.share 			= 0;
		itemEntry.image 			= input.image;
		itemEntry.meals 			= input.meals;
		switch(input.meals) {
			case '1': itemEntry.namemeals = "Sáng";
				break;
			case '2': itemEntry.namemeals = "Trưa";
				break;
			case '3': itemEntry.namemeals = "Xế";
				break;
			case '4': itemEntry.namemeals = "Tối";
				break;
		}
		itemEntry.cook 				= input.cook;
		itemEntry.age 				= input.age;
		itemEntry.mainmaterial 		= input.mainmaterial;
		itemEntry.description 		= input.description;

		if (itemEntry._id) {
			itemEntry._id = new ObjectID(itemEntry._id);
		}

		//-----------------------------------------
		// Post to facebook
		//-----------------------------------------
		var form = new FormData(); //Create multipart form
		var imageName = itemEntry.image.substr(itemEntry.image.indexOf('/upload/') + 8,itemEntry.image.length);
		form.append('file', fs.createReadStream('./app/public/upload/'+ imageName)); //Put file
		form.append('message', itemEntry.materials + "\r\n" + itemEntry.method); //Put message
		 
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
				foodDB.save(itemEntry, {safe: true}, callback);
			});

		});
		 
		//Binds form to request
		form.pipe(request);

		//If anything goes wrong (request-wise not FB)
		request.on('error', function (error) {
			callback(error,null);
		});
	} else {
		var nameMealsValue = "";
		switch(input.meals) {
			case '1': nameMealsValue = "Sáng";
				break;
			case '2': nameMealsValue = "Trưa";
				break;
			case '3': nameMealsValue = "Xế";
				break;
			case '4': nameMealsValue = "Tối";
				break;
		}

		foodDB.update( { _id : new ObjectID(input.itemid) }, 
							{ $set : { name 		: input.name,
									   materials 	: input.material,
									   method		: input.method,
									   image		: input.image,
									   meals		: input.meals,
									   namemeals	: nameMealsValue,
									   cook			: input.cook,
									   age			: input.age,
									   mainmaterial	: input.mainmaterial,
									   description	: input.description
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
	foodDB.find().sort([['name','asc']]).toArray(function(err,result){
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
exports.getFoodByID = function(foodid, callback){
	foodDB.findOne({_id:new ObjectID(foodid)}, function(err,result){
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
// Get list food
// Param page: curent page
// Param offset: offset setting
// Param callback: funtion callback
//--------------------------------
exports.getList365Food = function(page, offset, callback){
	var iSkip = (page - 1) * offset;
	var iOffset = page * offset;
	foodDB.find().sort([['_id','desc']]).skip(iSkip).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get count list food
// Param callback: funtion callback
//--------------------------------
exports.getCountList365Food = function(callback){
	foodDB.count({}, function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Delete food
// Param callback: funtion callback
//--------------------------------
exports.deleteFood = function(foodid, callback){
	foodDB.remove({ _id : new ObjectID(foodid) }, function(err,result){
		if(err)
			callback(err,'Can not delete food');
		else
			callback(null,result);
	});
}