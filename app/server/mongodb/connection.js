var crypto 		= require('crypto');
var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');
var moment 		= require('moment');
var ObjectID	= require('mongodb').ObjectID;

var dbPort 		= 10066; //27017;
var dbHost 		= 'dharma.mongohq.com';//'localhost';
var dbName 		= 'ikiddydb';
var mongo_db_username = 'luckyluck4989';
var mongo_db_password = '242497621176Luck';

// establish the database connection
var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
db.open(function(e, p_client){
	if (e) {
		//console.log(e);
	}	else{
		p_client.authenticate(mongo_db_username,mongo_db_password,{},function(err,success){
			if (err) {
				console.warn("MONGO ERROR: unauthorized "+ err.message);

			} else {
				console.log("MONGO Authorized");
				console.log('connected to database :: ' + dbName);
			}
		});
	}
});

module.exports = {
		account:db.collection('account'),
		category:db.collection('category'),
		subcategory:db.collection('subcategory'),
		foodcate:db.collection('foodcate'),
		foodsubcate:db.collection('foodsubcate'),
		news:db.collection('news'),
		food:db.collection('food'),
		videocate:db.collection('videocategory'),
		video:db.collection('video'),
		learncate:db.collection('learncate'),
		learn:db.collection('learn'),
		crypto:crypto,
		ObjectID:ObjectID,
		moment:moment 
}