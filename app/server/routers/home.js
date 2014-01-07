var accountModel = require('../modules/account')
var newsModel = require('../modules/news')
var imageModel = require('../modules/image')
var userHistoryModel = require('../modules/userhistory')
var cateModel = require('../modules/category')
var logModel = require('../modules/logcollect')
var crypto = require('crypto')

//--------------------------------
// Define Variable 
//--------------------------------
var SYSTEM_ERR = 'ERROR';
var SYSTEM_SUC = 'SUCESS';
var STATUS_SUCESS = 200;
var STATUS_FAIL = 400;
var METHOD_POS = 'POS';
var METHOD_GET = 'GET';

//--------------------------------
// Define Message
//--------------------------------
var MSG_LOGINFAIL = 'Username or password is not correctly';
var MSG_INVALID_TOKEN = 'Your token is invalid';

//--------------------------------
// SAMPLE RESULT JSON
// param func: function name excute
// mthod: method excute [POST/GET]
// stt: result status of function
// msg: message status
// err: error detail of result excute function
// res: result of function
// Return: json result
//--------------------------------
function createJsonResult(func,mthod,stt,msg,err,res){
	var jsonResult = {	func_cd: func,
						method: mthod,
						status: stt,
						message: msg,
						error: err,
						result: res,
					};
	return jsonResult;
}

//--------------------------------
// VALIDATE PARAMETER
// value: value of parameter
// type: type of parameter
// Return: json result
//--------------------------------
function validateParam(value, type){
	// TYPE 1 : OBJECTID
	if( type == 1){
		if( value == null){
			return "Locationid is null !";
		} else if(value.length != 24){
			return "Length of locationid is not valid !";
		} else {
			return "";
		}
	} else {
		return "";
	}
}

module.exports = function(app, nodeuuid){
	//------------------------------------------------------------------
	// ADMIN
	//------------------------------------------------------------------
	app.get('/',function(req,res){
		if(req.session.user != undefined){
			res.redirect('/listlocation');
		} else {
			// path : use for show view is login or home page
			res.redirect('/loginad');
		}
	});

	app.get('/admin',function(req,res){
		res.render('block/admin', { title: 'Admin Page' });
	});

	//------------------------------------------------------------------
	// Get list location page = 1
	// Return: render location page
	//------------------------------------------------------------------
	app.get('/listnewsch',function(req,res){
		if(req.session.user != null){
			var jsonResult = createJsonResult('GetListNewsCH', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, null);
			jsonResult.subcate = req.session.subcate;
			res.render('block/listnewsch', { title: 'List News', path : req.path, resultJson : jsonResult });
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Get list location by page
	// Return: list location
	//------------------------------------------------------------------
	app.post('/listnewsch',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var page = input.page;
			var subcategory = input.subcate;
			var offset = 10;
			if(input.subcate == 0)
				subcategory = req.session.subcate;
			if(input.subcate != 0)
				req.session.subcate = input.subcate;
			newsModel.getListNewsCH(subcategory, page, offset, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('GetListNewsCH', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					newsModel.getCountListNewsCH(subcategory, function (err, retJsonCount) {
						var jsonResult = createJsonResult('GetListNewsCH', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
						jsonResult.result2 = retJsonCount;
						res.json(jsonResult, 200);
					});
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Set news to session
	// Return: list news
	//------------------------------------------------------------------
	app.post('/admnews',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			req.session.newsid = input.newsid;
			res.json(req.session.user, 200);
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Delete News
	// Return: Delete News
	//--------------------------------
	app.post('/delnews',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var newsid = input.newsid;
			newsModel.deleteNews(newsid, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('Delete News', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('Delete News', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
					res.json(jsonResult,200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Render view login
	// Return: render view login
	//------------------------------------------------------------------
	app.get('/loginad',function(req,res){
		if(req.session.user != null){
			res.redirect('/listlocation');
		} else {
			// path : use for show view is login or home page
			res.render('block/loginad', { title: 'Login', path: req.path });
		}
	});

	//------------------------------------------------------------------
	// Signin admin
	// Return: json user and set req session
	//------------------------------------------------------------------
	app.post('/signin',function(req,res){
		var input = req.body;
		//var userid = input.txtUserName;
		var userid = 'admin';
		var password = crypto.createHash('md5').update(input.txtPassword).digest("hex");
		accountModel.checkLogin(userid, password, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('Login', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, err, null);
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				req.session.user = objects;
				var jsonResult = createJsonResult('Login', METHOD_POS, STATUS_SUCESS, SYSTEM_SUC, null, objects);
				res.json(jsonResult, 200);
			} else {
				var jsonResult = createJsonResult('Login', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, MSG_LOGINFAIL, null);
				res.json(jsonResult, 200);
			}
		});
	});

	//--------------------------------
	// Get list category and subcategory
	// Return: JSON list country
	//--------------------------------
	app.post('/getlistcc',function(req,res){
		if(req.session.user != null){
			cateModel.getListCategory(function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('GetListCategory', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					cateModel.getListSubCategory(function (err, retJsonSub) {
						if (err) {
							var jsonResult = createJsonResult('GetListSubCategory', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
							res.json(jsonResult, 400);
							return;
						} else {
							var jsonResult = createJsonResult('GetListSubCategory', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
							jsonResult.resultsub = retJsonSub;
							res.json(jsonResult,200);
						}
					});
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Get news in admin
	// Return: list news
	//------------------------------------------------------------------
	app.get('/news',function(req,res){
		if(req.session.user != null){
			if(req.session.newsid != null){
				res.render('block/news', { title: 'Location', path: req.path, newsid : req.session.newsid });
			} else {
				res.render('block/news', { title: 'Location', path: req.path, newsid : null });
			}
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Set location to session
	// Return: list location
	//------------------------------------------------------------------
	app.post('/getadmnews',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var newsid = input.newsid;
			newsModel.getNewsByID(newsid, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('Get News', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
					res.json(jsonResult, 400);
					return;
				} else {
					req.session.newsid = null;
					var jsonResult = createJsonResult('Get News', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
					res.json(jsonResult, 200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// API
	// Add news event
	// Return: When upload image Then Return list Image Name
	//------------------------------------------------------------------
	app.post('/addnews',function(req,res){
		//--------------------------------
		// Define parameter
		//--------------------------------
		var arr = [];
		var input = req.body;

		//--------------------------------
		// Case: Upload image
		//--------------------------------
		if(input.typeSubmit == 'uploadImage'){
			if (!input.title) {
				res.json("content must be specified when saving a new article", 400);
				return;
			}

			// Upload multi images
			if(req.files.photos[0].path == undefined){
				for(var i=0; i < req.files.photos[0].length; i++){
					// Call function upload images
					newsModel.addImage(input, req.files.photos[0][i], function (err, objects) {
						if (err) {
							res.json(err, 400);
							return;
						} else {
							arr.push(objects);
						}
					});
				}
			// Upload only one images
			} else {
				newsModel.addImage(input, req.files.photos[0], function (err, objects) {
					if (err) {
						res.json(err, 400);
						return;
					} else {
						arr.push(objects);
					}
				});
			}
			res.json(arr,200);

		//--------------------------------
		// Case: Entry data
		//--------------------------------
		} else {
			newsModel.addNews(input, function (err, objects) {
				if (err) {
					res.json(err, 400);
					return;
				} else {
					res.json("Success",200);
				}
			});
		}
	});

	//------------------------------------------------------------------
	// Get category of infonews
	// Return: list category
	//------------------------------------------------------------------
	//--------------------------------
	// Get list image what's hot
	// Return: JSON list image
	//--------------------------------
	app.get('/getnewsinfocategory',function(req,res){
		// CODE DEFINE
		// 1: Info Product
		// 2: Info Calo
		// 3: Info Tips
		var code = req.param('code');
		cateModel.getAllCategoryByCode(code, function (err, retJson) {
			if (err) {
				var jsonResult = createJsonResult('GetAllCategoryByCode', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else {
				var jsonResult = createJsonResult('GetAllCategoryByCode', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
				res.json(jsonResult,200);
			}
		});
	});

	//------------------------------------------------------------------
	// Get all news by sub category
	// Return: list news
	//------------------------------------------------------------------
	app.get('/getnewsbysubcategory',function(req,res){
		var subcate = req.param('subcategory');
		newsModel.getNewsBySub(subcate, function (err, retJson) {
			if (err) {
				var jsonResult = createJsonResult('GetNewsBySub', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else {
				var jsonResult = createJsonResult('GetNewsBySub', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
				res.json(jsonResult,200);
			}
		});
	});

	//------------------------------------------------------------------
	// Get news by id
	// Return: news
	//------------------------------------------------------------------
	app.get('/getnewsbyid',function(req,res){
		var newsid = req.param('newsid');

		// Validate locationid
		var errmsg = validateParam(newsid.toString(),1);
		if(errmsg != ""){
			var jsonResult = createJsonResult('GetNewsByID', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, errmsg, null)
			res.json(jsonResult, 400);
		} else {
			newsModel.getNewsByID(newsid, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('GetNewsByID', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('GetNewsByID', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
					res.json(jsonResult,200);
				}
			});
		}
	});

	//------------------------------------------------------------------
	// Update share, like, add
	// Return: list location
	//------------------------------------------------------------------
	app.post('/updatenewslikeshare',function(req,res){
		var input	= req.body;
		var newsid	= input.newsid;
		var like	= input.like;
		var share	= input.share;
		var add		= input.add;

		// Validate locationid
		var errmsg = validateParam(newsid.toString(),1);
		if(errmsg != ""){
			var jsonResult = createJsonResult('UpdateLikeShare', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, errmsg, null)
			res.json(jsonResult, 400);
		} else {
			newsModel.updateLikeShare(newsid, like, share, add, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('UpdateLikeShare', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, err, null)
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('UpdateLikeShare', METHOD_POS, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
					res.json(jsonResult,200);
				}
			});
		}
	});

	//------------------------------------------------------------------
	// Count like by group info new
	// Return: list location
	//------------------------------------------------------------------
	app.get('/gettotalnewsinfo',function(req,res){
		// CODE DEFINE
		// 1: Info Product
		// 2: Info Calo
		// 3: Info Tips
		var code = req.param('code');
		newsModel.getTotalNewsInfo(code, function (err, retJson) {
			if (err) {
				var jsonResult = createJsonResult('GetTotalNewsInfo', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else {
				cateModel.getAllCategoryByCode(code, function (err, retJsonCate) {
					if (err) {
						var jsonResult = createJsonResult('GetAllCategoryByCode', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						for(var i = 0; i < retJsonCate.length; i++){
							if( retJsonCate[i] != undefined ){
								retJson[i].name = retJsonCate[i].subcategoryname;
								retJson[i].image = retJsonCate[i].image;
							}
						}
						var jsonResult = createJsonResult('GetTotalNewsInfo', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			}
		});
	});

	//------------------------------------------------------------------
	// Get location in admin
	// Return: list location
	//------------------------------------------------------------------
	
	
	//------------------------------------------------------------------
	// Get news by id
	// Return: news
	//------------------------------------------------------------------
};