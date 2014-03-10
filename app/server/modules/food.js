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
							name_meals		: "",
							cook			: "",
							name_cook		: "",
							age				: "",
							name_age			: "",
							mainmaterial	: "",
							name_mainmaterial : "",
							description		: ""
						};
  
		itemEntry.name				= input.name;
		itemEntry.materials 		= input.material;
		itemEntry.method 			= input.method;
		itemEntry.like 				= 0;
		itemEntry.share 			= 0;
		itemEntry.image 			= input.image;
		itemEntry.meals 			= input.meals;
		itemEntry.cook 				= input.cook;
		itemEntry.age 				= input.age;
		itemEntry.mainmaterial 		= input.mainmaterial;
		itemEntry.description 		= input.description;

		switch(input.meals) {
			case '41': itemEntry.name_meals = "Sáng";
				break;
			case '42': itemEntry.name_meals = "Trưa";
				break;
			case '43': itemEntry.name_meals = "Chiều";
				break;
			case '44': itemEntry.name_meals = "Tối";
				break;
		}

		switch(input.cook) {
			case '51': itemEntry.name_cook = "Bột – Nghiền";
				break;
			case '52': itemEntry.name_cook = "Cháo";
				break;
			case '53': itemEntry.name_cook = "Cơm";
				break;
			case '54': itemEntry.name_cook = "Canh – Soup";
				break;
			case '54': itemEntry.name_cook = "Các món khác";
				break;
		}

		switch(input.age) {
			case '61': itemEntry.name_age = "6-10 tháng";
				break;
			case '62': itemEntry.name_age = "11-18 tháng";
				break;
			case '63': itemEntry.name_age = "19-36 tháng";
				break;
		}

		switch(input.mainmaterial) {
			case '71': itemEntry.name_mainmaterial = "Heo";
				break;
			case '72': itemEntry.name_mainmaterial = "Bò";
				break;
			case '73': itemEntry.name_mainmaterial = "Gà";
				break;
			case '74': itemEntry.name_mainmaterial = "Hải sản";
				break;
			case '75': itemEntry.name_mainmaterial = "Rau củ quả";
				break;
			case '76': itemEntry.name_mainmaterial = "Nguyên liệu khác";
				break;
		}

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
		var nameCook = "";
		var nameAge = "";
		var nameMainMaterial = "";

		switch(input.meals) {
			case '41': nameMealsValue = "Sáng";
				break;
			case '42': nameMealsValue = "Trưa";
				break;
			case '43': nameMealsValue = "Chiều";
				break;
			case '44': nameMealsValue = "Tối";
				break;
		}

		switch(input.cook) {
			case '51': nameCook = "Bột – Nghiền";
				break;
			case '52': nameCook = "Cháo";
				break;
			case '53': nameCook = "Cơm";
				break;
			case '54': nameCook = "Canh – Soup";
				break;
			case '54': nameCook = "Các món khác";
				break;
		}

		switch(input.age) {
			case '61': nameAge = "6-10 tháng";
				break;
			case '62': nameAge = "11-18 tháng";
				break;
			case '63': nameAge = "19-36 tháng";
				break;
		}

		switch(input.mainmaterial) {
			case '71': nameMainMaterial = "Heo";
				break;
			case '72': nameMainMaterial = "Bò";
				break;
			case '73': nameMainMaterial = "Gà";
				break;
			case '74': nameMainMaterial = "Hải sản";
				break;
			case '75': nameMainMaterial = "Rau củ quả";
				break;
			case '76': nameMainMaterial = "Nguyên liệu khác";
				break;
		}

		foodDB.update( { _id : new ObjectID(input.itemid) }, 
							{ $set : { name 		: input.name,
									   materials 	: input.material,
									   method		: input.method,
									   image		: input.image,
									   meals		: input.meals,
									   name_meals	: nameMealsValue,
									   cook			: input.cook,
									   name_cook	: nameCook,
									   age			: input.age,
									   name_age		: nameAge,
									   mainmaterial	: input.mainmaterial,
									   name_mainmaterial	: nameMainMaterial,
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
// Get list 365 food
// Param callback: funtion callback
//--------------------------------
exports.getFoodByProperties = function(prop, callback){
	if (Number(prop) < 50) {
		foodDB.find({ meals : prop }).sort([['name','asc']]).toArray(function(err,result){
			if(err)
				callback(err,'Can not get list location');
			else
				callback(null,result);
		});
	} else if (Number(prop) < 60) {
		foodDB.find({ cook : prop }).sort([['name','asc']]).toArray(function(err,result){
			if(err)
				callback(err,'Can not get list location');
			else
				callback(null,result);
		});
	} else if (Number(prop) < 70) {
		foodDB.find({ age : prop }).sort([['name','asc']]).toArray(function(err,result){
			if(err)
				callback(err,'Can not get list location');
			else
				callback(null,result);
		});
	} else {
		foodDB.find({ mainmaterial : prop }).sort([['name','asc']]).toArray(function(err,result){
			if(err)
				callback(err,'Can not get list location');
			else
				callback(null,result);
		});
	} 
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
exports.getTotalFoodInfo = function(code, callback){
	switch(Number(code)) {
		case 4:
			foodDB.aggregate( [
				{ $group: { _id			: { meals : "$meals", name_meals : "$name_meals"},
							sum_like	: { $sum: "$like" },
							sum_share	: { $sum: "$share" }, 
							sum_add		: { $sum: "$add" },
							count		: { $sum: 1 }
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
			break;
		case 5:
			foodDB.aggregate( [
				{ $group: { _id			: { cook : "$cook", name_cook : "$name_cook"},
							sum_like	: { $sum: "$like" },
							sum_share	: { $sum: "$share" }, 
							sum_add		: { $sum: "$add" },
							count		: { $sum: 1 }
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
			break;
		case 6:
			foodDB.aggregate( [
				{ $group: { _id			: { age : "$age", name_age : "$name_age"},
							sum_like	: { $sum: "$like" },
							sum_share	: { $sum: "$share" }, 
							sum_add		: { $sum: "$add" },
							count		: { $sum: 1 }
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
			break;
		case 7:
			foodDB.aggregate( [
				{ $group: { _id			: { mainmaterial : "$mainmaterial", name_mainmaterial : "$name_mainmaterial"},
							sum_like	: { $sum: "$like" },
							sum_share	: { $sum: "$share" }, 
							sum_add		: { $sum: "$add" },
							count		: { $sum: 1 }
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
			break;
	}
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