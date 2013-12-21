var cnMongoDB = require('../mongodb/connection');
var categoryDB = cnMongoDB.category;
var subcategoryDB  = cnMongoDB.subcategory;

// Get list category
exports.getListCategory = function(callback){
	categoryDB.find({}).sort([['categoryid','asc']]).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list category');
		else
			callback(null,result);
	});
}

// Get list city
exports.getListSubCategory = function(callback){
	subcategoryDB.find({}).sort([['subcategoryid','asc']]).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list city');
		else
			callback(null,result);
	});
}

// Get list category by code
exports.getAllCategoryByCode = function(code, callback){
	subcategoryDB.find({categoryid : Number(code)}).sort([['subcategoryid','asc']]).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list city');
		else
			callback(null,result);
	});
}

/*
// Get country
exports.getCountry = function(countryid, callback){
	countryDB.findOne({ country : countryid }, function(err,result){
		if(err)
			callback(err,'Can not get list country');
		else
			callback(null,result);
	});
}

// Update/Insert country
exports.updateCountry = function(country, countryid, countryname, callback){
	if(countryid != ''){
		countryDB.update( { 'country' : country }, { $set : { countryName : countryname} }, function(err,result){
			if(err)
				callback(err,'Can not update user');
			else
				callback(null,result);
		});
	} else {
		countryDB.findOne({ country : country }, function(err,result){
			if(err){
				callback(err,'Can not get country');
			} else {
				if(result == null){
					countryDB.insert({
										"country": country,
										"countryName": countryname
									},function(err,result){
						if(err)
							callback(err,'Can insert country');
						else
							callback(null,result);
					});
				} else {
					callback(null,null);
				}
			}
		});
	}
}

// Delete
exports.deleteCountry = function(country, callback){
	countryDB.remove( { 'country' : country }, function(err,result){
		if(err)
			callback(err,'Can not delete user');
		else
			callback(null,result);
	});
}

// Get city
exports.getCity = function(cityid, callback){
	cityDB.findOne({ city : cityid }, function(err,result){
		if(err)
			callback(err,'Can not get list country');
		else
			callback(null,result);
	});
}

// Update/Insert city
exports.updateCity = function(city, cityid, cityname, country, callback){
	if(cityid != ''){
		cityDB.update( { 'city' : city }, { $set : { cityName : cityname, country : country } }, function(err,result){
			if(err)
				callback(err,'Can not update user');
			else
				callback(null,result);
		});
	} else {
		cityDB.findOne({ city : city }, function(err,result){
			if(err){
				callback(err,'Can not get country');
			} else {
				if(result == null){
					cityDB.insert({
										"city": city,
										"cityName": cityname,
										"country": country
									},function(err,result){
						if(err)
							callback(err,'Can insert country');
						else
							callback(null,result);
					});
				} else {
					callback(null,null);
				}
			}
		});
	}
}

// Delete city
exports.deleteCity = function(city, callback){
	cityDB.remove( { 'city' : city }, function(err,result){
		if(err)
			callback(err,'Can not delete user');
		else
			callback(null,result);
	});
}
*/