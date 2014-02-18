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