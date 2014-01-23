var accountModel = require('../modules/account')
var newsModel = require('../modules/news')
var foodModel = require('../modules/food')
var videoModel = require('../modules/video')
var videoCateModel = require('../modules/videocate')
var learnCateModel = require('../modules/learncate')
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
			return "Id is null !";
		} else if(value.length != 24){
			return "Length of id is not valid !";
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
			res.redirect('/listnewsch');
		} else {
			// path : use for show view is login or home page
			res.redirect('/loginad');
		}
	});

	app.get('/admin',function(req,res){
		res.render('block/admin', { title: 'Admin Page' });
	});

	//------------------------------------------------------------------
	// Get list info new page = 1
	// Return: render info news page
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
	// Get list 365 page = 1
	// Return: render 365 list page
	//------------------------------------------------------------------
	app.get('/listm365',function(req,res){
		if(req.session.user != null){
			var jsonResult = createJsonResult('GetList365', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, null);
			res.render('block/listm365', { title: 'List 365 Food', path : req.path, resultJson : jsonResult });
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Get list video page = 1
	// Return: render video list page
	//------------------------------------------------------------------
	app.get('/listvideo',function(req,res){
		if(req.session.user != null){
			var jsonResult = createJsonResult('GetListVideo', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, null);
			res.render('block/listvideo', { title: 'List Video', path : req.path, resultJson : jsonResult });
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Get list video category page = 1
	// Return: render video category list page
	//------------------------------------------------------------------
	app.get('/listvideocate',function(req,res){
		if(req.session.user != null){
			var jsonResult = createJsonResult('GetListVideoCategory', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, null);
			res.render('block/listvideocate', { title: 'List Video Category', path : req.path, resultJson : jsonResult });
		} else {
			res.redirect('/loginad');
		}
	});


	//------------------------------------------------------------------
	// Get list learn category page = 1
	// Return: render learn category list page
	//------------------------------------------------------------------
	app.get('/listlearncate',function(req,res){
		if(req.session.user != null){
			var jsonResult = createJsonResult('GetListLearnCategory', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, null);
			res.render('block/listlearncate', { title: 'List Learn Category', path : req.path, resultJson : jsonResult });
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
	// Get list 365 food by page
	// Return: list 365 food
	//------------------------------------------------------------------
	app.post('/listm365',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var page = input.page;
			var offset = 10;
			foodModel.getList365Food(page, offset, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('GetList365', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					foodModel.getCountList365Food(function (err, retJsonCount) {
						var jsonResult = createJsonResult('GetList365', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
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
	// Get list video by page
	// Return: list video
	//------------------------------------------------------------------
	app.post('/listvideo',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var page = input.page;
			var offset = 10;
			videoModel.getListVideo(page, offset, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('GetListVideo', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					videoModel.getCountListVideo(function (err, retJsonCount) {
						var jsonResult = createJsonResult('GetListVideo', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
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
	// Get list video category by page
	// Return: list video category
	//------------------------------------------------------------------
	app.post('/listvideocate',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var page = input.page;
			var offset = 10;
			videoCateModel.getListVideoCate(page, offset, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('GetListVideoCate', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					videoCateModel.getCountVideoCate(function (err, retJsonCount) {
						var jsonResult = createJsonResult('GetListVideoCate', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
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
	// Get list learn category by page
	// Return: list learn category
	//------------------------------------------------------------------
	app.post('/listlearncate',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var page = input.page;
			var offset = 10;
			learnCateModel.getListLearnCate(page, offset, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('GetListLearnoCate', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					learnCateModel.getCountLearnCate(function (err, retJsonCount) {
						var jsonResult = createJsonResult('GetListLearnCate', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
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
	// Set foods to session
	// Return: list news
	//------------------------------------------------------------------
	app.post('/admm365',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			req.session.foodid = input.itemid;
			res.json(req.session.user, 200);
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Set video to session
	// Return: list news
	//------------------------------------------------------------------
	app.post('/admvideo',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			req.session.videoid = input.itemid;
			res.json(req.session.user, 200);
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Set foods to session
	// Return: list news
	//------------------------------------------------------------------
	app.post('/admvideocate',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			req.session.videocateid = input.itemid;
			res.json(req.session.user, 200);
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Set learn cate to session
	// Return: list news
	//------------------------------------------------------------------
	app.post('/admlearncate',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			req.session.learncateid = input.itemid;
			res.json(req.session.user, 200);
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Delete Food
	// Return: Delete Food
	//--------------------------------
	app.post('/delm365',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var foodid = input.itemid;
			foodModel.deleteFood(foodid, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('Delete Food', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('Delete Food', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
					res.json(jsonResult,200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Delete Video
	// Return: Delete Video
	//--------------------------------
	app.post('/delvideo',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var videoid = input.itemid;
			videoModel.deleteVideo(videoid, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('Delete Video', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('Delete Video', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
					res.json(jsonResult,200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Delete video category
	// Return: Delete video category
	//--------------------------------
	app.post('/delvideocate',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var cateid = input.itemid;
			videoCateModel.deleteVideoCate(cateid, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('Delete Video Category', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('Delete Video Category', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
					res.json(jsonResult,200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Delete learn category
	// Return: Delete video category
	//--------------------------------
	app.post('/dellearncate',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var cateid = input.itemid;
			learnCateModel.deleteLearnCate(cateid, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('Delete Learn Category', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('Delete Learn Category', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
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

	//--------------------------------
	// Get list category video
	// Return: JSON list country
	//--------------------------------
	app.post('/getlistvideocate',function(req,res){
		if(req.session.user != null){
			videoCateModel.getAllVideoCate(function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('GetAllVideoCate', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('GetAllVideoCate', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
					res.json(jsonResult,200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Get list category learn
	// Return: JSON list country
	//--------------------------------
	app.post('/getlistlearncate',function(req,res){
		if(req.session.user != null){
			learnCateModel.getAllLearnCate(function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('GetAllLearnCate', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('GetAllLearnCate', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
					res.json(jsonResult,200);
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
	// Get food in admin
	// Return: list food
	//------------------------------------------------------------------
	app.get('/m365',function(req,res){
		if(req.session.user != null){
			if(req.session.foodid != null){
				res.render('block/m365', { title: 'Food', path: req.path, itemid : req.session.foodid });
			} else {
				res.render('block/m365', { title: 'Food', path: req.path, itemid : null });
			}
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Get food in admin
	// Return: list food
	//------------------------------------------------------------------
	app.get('/video',function(req,res){
		if(req.session.user != null){
			if(req.session.videoid != null){
				res.render('block/video', { title: 'Food', path: req.path, itemid : req.session.videoid });
			} else {
				res.render('block/video', { title: 'Food', path: req.path, itemid : null });
			}
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Get video cate in admin
	// Return: list food
	//------------------------------------------------------------------
	app.get('/videocate',function(req,res){
		if(req.session.user != null){
			if(req.session.videocateid != null){
				res.render('block/videocate', { title: 'Video Category', path: req.path, itemid : req.session.videocateid });
			} else {
				res.render('block/videocate', { title: 'Video Category', path: req.path, itemid : null });
			}
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Get learn cate in admin
	// Return: list food
	//------------------------------------------------------------------
	app.get('/learncate',function(req,res){
		if(req.session.user != null){
			if(req.session.learncateid != null){
				res.render('block/learncate', { title: 'Video Category', path: req.path, itemid : req.session.learncateid });
			} else {
				res.render('block/learncate', { title: 'Video Category', path: req.path, itemid : null });
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
	// Set foodid to session
	// Return: list foods
	//------------------------------------------------------------------
	app.post('/getadmm365',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var foodid = input.itemid;
			foodModel.getFoodByID(foodid, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('Get Food', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
					res.json(jsonResult, 400);
					return;
				} else {
					req.session.foodid = null;
					var jsonResult = createJsonResult('Get Food', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
					res.json(jsonResult, 200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Get video by id session
	// Return: list foods
	//------------------------------------------------------------------
	app.post('/getadmvideo',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var videoid = input.itemid;
			videoModel.getVideoByID(videoid, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('Get Food', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
					res.json(jsonResult, 400);
					return;
				} else {
					req.session.videoid = null;
					var jsonResult = createJsonResult('Get Food', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
					res.json(jsonResult, 200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Get video category by id
	// Return: list foods
	//------------------------------------------------------------------
	app.post('/getadmvideocate',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var cateid = input.itemid;
			videoCateModel.getVideoCategoryByID(cateid, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('Get Video Category', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
					res.json(jsonResult, 400);
					return;
				} else {
					req.session.videocateid = null;
					var jsonResult = createJsonResult('Get Video Category', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
					res.json(jsonResult, 200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Get learn category by id
	// Return: list foods
	//------------------------------------------------------------------
	app.post('/getadmlearncate',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var cateid = input.itemid;
			learnCateModel.getLearnCategoryByID(cateid, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('Get Learn Category', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
					res.json(jsonResult, 400);
					return;
				} else {
					req.session.learncateid = null;
					var jsonResult = createJsonResult('Get Learn Category', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
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
	// Add new food
	// Return: food added
	//------------------------------------------------------------------
	app.post('/addm365',function(req,res){
		//--------------------------------
		// Define parameter
		//--------------------------------
		var arr = [];
		var input = req.body;

		//--------------------------------
		// Case: Upload image
		//--------------------------------
		if(input.typeSubmit == 'uploadImage'){
			if (!input.name) {
				res.json("name must be specified when saving a new article", 400);
				return;
			}

			// Upload multi images
			if(req.files.photos[0].path == undefined){
				for(var i=0; i < req.files.photos[0].length; i++){
					// Call function upload images
					foodModel.addImage(input, req.files.photos[0][i], function (err, objects) {
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
				foodModel.addImage(input, req.files.photos[0], function (err, objects) {
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
			foodModel.addItem(input, function (err, objects) {
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
	// Add new video
	// Return: food added
	//------------------------------------------------------------------
	app.post('/addvideo',function(req,res){
		//--------------------------------
		// Define parameter
		//--------------------------------
		var arr = [];
		var input = req.body;

		//--------------------------------
		// Case: Upload image
		//--------------------------------
		if(input.typeSubmit == 'uploadImage'){
			if (!input.name) {
				res.json("name must be specified when saving a new article", 400);
				return;
			}

			// Upload multi images
			if(req.files.photos[0].path == undefined){
				for(var i=0; i < req.files.photos[0].length; i++){
					// Call function upload images
					videoModel.addImage(input, req.files.photos[0][i], function (err, objects) {
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
				videoModel.addImage(input, req.files.photos[0], function (err, objects) {
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
			videoModel.addItem(input, function (err, objects) {
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
	// Add new video category
	// Return: video category added
	//------------------------------------------------------------------
	app.post('/addvideocate',function(req,res){
		//--------------------------------
		// Define parameter
		//--------------------------------
		var arr = [];
		var input = req.body;

		//--------------------------------
		// Case: Upload image
		//--------------------------------
		if(input.typeSubmit == 'uploadImage'){
			if (!input.name) {
				res.json("name must be specified when saving a new article", 400);
				return;
			}

			// Upload multi images
			if(req.files.photos[0].path == undefined){
				for(var i=0; i < req.files.photos[0].length; i++){
					// Call function upload images
					videoCateModel.addImage(input, req.files.photos[0][i], function (err, objects) {
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
				videoCateModel.addImage(input, req.files.photos[0], function (err, objects) {
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
			videoCateModel.addItem(input, function (err, objects) {
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
	// Add new learn category
	// Return: learn category added
	//------------------------------------------------------------------
	app.post('/addlearncate',function(req,res){
		//--------------------------------
		// Define parameter
		//--------------------------------
		var arr = [];
		var input = req.body;

		//--------------------------------
		// Case: Upload image
		//--------------------------------
		if(input.typeSubmit == 'uploadImage'){
			if (!input.name) {
				res.json("name must be specified when saving a new article", 400);
				return;
			}

			// Upload multi images
			if(req.files.photos[0].path == undefined){
				for(var i=0; i < req.files.photos[0].length; i++){
					// Call function upload images
					learnCateModel.addImage(input, req.files.photos[0][i], function (err, objects) {
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
				learnCateModel.addImage(input, req.files.photos[0], function (err, objects) {
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
			learnCateModel.addItem(input, function (err, objects) {
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
	// Get list 365 food
	// Return: list food
	//------------------------------------------------------------------
	app.get('/getall365food',function(req,res){
		foodModel.getAll365Food(function (err, retJson) {
			if (err) {
				var jsonResult = createJsonResult('Getlist365food', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else {
				var jsonResult = createJsonResult('Getlist365food', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
				res.json(jsonResult,200);
			}
		});
	});
	//------------------------------------------------------------------
	// Get food
	// Return: food
	//------------------------------------------------------------------
	app.get('/getfoodbyid',function(req,res){
		var foodid = req.param('foodid');

		// Validate locationid
		var errmsg = validateParam(foodid.toString(),1);
		if(errmsg != ""){
			var jsonResult = createJsonResult('GetFoodByID', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, errmsg, null)
			res.json(jsonResult, 400);
		} else {
			foodModel.getFoodByID(foodid, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('GetFoodByID', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('GetFoodByID', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
					res.json(jsonResult,200);
				}
			});
		}
	});

	//------------------------------------------------------------------
	// Update like and share food
	// Return: food
	//------------------------------------------------------------------
	app.post('/updatefoodlikeshare',function(req,res){
		var input	= req.body;
		var foodid	= input.foodid;
		var like	= input.like;
		var share	= input.share;

		// Validate locationid
		var errmsg = validateParam(foodid.toString(),1);
		if(errmsg != ""){
			var jsonResult = createJsonResult('UpdateLikeShare', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, errmsg, null)
			res.json(jsonResult, 400);
		} else {
			foodModel.updateLikeShare(foodid, like, share, function (err, retJson) {
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
	// Count video by category
	// Return: list category video
	//------------------------------------------------------------------
	app.get('/getvideocategory',function(req,res){
		videoModel.getTotalVideoInfo(function (err, retJson) {
			if (err) {
				var jsonResult = createJsonResult('GetTotalVideo', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else {
				videoCateModel.getAllVideoCate(function (err, retJsonCate) {
					if (err) {
						var jsonResult = createJsonResult('GetAllCategoryByCode', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						for(var i = 0; i < retJsonCate.length; i++){
							for( var j = 0; j < retJson.length; j++)
							{
								if(retJson[j]._id == retJsonCate[i]._id){
									retJson[j].category = retJsonCate[i].name;
									retJson[j].image = retJsonCate[i].image;
									break;
								}
							}
						}
						var jsonResult = createJsonResult('GetTotalVideo', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			}
		});
	});

	//------------------------------------------------------------------
	// Update like and share video
	// Return: video
	//------------------------------------------------------------------
	app.post('/updatevideolikeshare',function(req,res){
		var input	= req.body;
		var videoid	= input.videoid;
		var like	= input.like;
		var share	= input.share;
		var down	= input.down;

		// Validate locationid
		var errmsg = validateParam(videoid.toString(),1);
		if(errmsg != ""){
			var jsonResult = createJsonResult('UpdateLikeShare', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, errmsg, null)
			res.json(jsonResult, 400);
		} else {
			videoModel.updateLikeShare(videoid, like, share, down, function (err, retJson) {
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
	// Get Video by Category
	// Return: video
	//------------------------------------------------------------------
	app.get('/getvideobycategory',function(req,res){
		var cateid = req.param('category');
		videoModel.getAllVideoByCate(cateid, function (err, retJson) {
			if (err) {
				var jsonResult = createJsonResult('GetAllVideoByCategory', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else {
				var jsonResult = createJsonResult('GetAllVideoByCategory', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
				res.json(jsonResult,200);
			}
		});
	});

	//------------------------------------------------------------------
	// Get Video by Category
	// Return: video
	//------------------------------------------------------------------
	app.get('/getvideobyid',function(req,res){
		var videoid = req.param('videoid');

		// Validate locationid
		var errmsg = validateParam(videoid.toString(),1);
		if(errmsg != ""){
			var jsonResult = createJsonResult('GetFoodByID', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, errmsg, null)
			res.json(jsonResult, 400);
		} else {
			videoModel.getVideoByID(videoid, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('GetAllVideoByCategory', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('GetAllVideoByCategory', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
					res.json(jsonResult,200);
				}
			});
		}
	});
	//------------------------------------------------------------------
	// Get news by id
	// Return: news
	//------------------------------------------------------------------
};