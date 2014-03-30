var cnMongoDB = require('../mongodb/connection'),
				ObjectID = cnMongoDB.ObjectID,
				fs = require("fs");
var MongoDb = require("mongodb");
var learnDB = cnMongoDB.learn;
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
exports.addLearn = function(input, callback){
	if(input.learnid == ''){
		//-----------------------------------------
		// Define item insert to database
		//-----------------------------------------
		var iDate = new Date();
		var itemEntry = {	name_vn			: "",
							learncate		: 1,
							name_en			: "",
							image			: ""
						};
  
		itemEntry.name_vn			= input.name_vn;
		itemEntry.learncate 		= input.learncate;
		itemEntry.name_en 			= input.name_en;
		itemEntry.image 			= input.image;

		if (itemEntry._id) {
			itemEntry._id = new ObjectID(itemEntry._id);
		}

		learnDB.save(itemEntry, {safe: true}, callback);
	} else {
		learnDB.update( { _id : new ObjectID(input.learnid) }, 
							{ $set : { name_vn 		: input.name_vn,
									   learncate 	: input.learncate,
									   name_en		: input.name_en,
									   image		: input.image
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
exports.getAllLearnByCate = function(cateid, callback){
	learnDB.find({learncate : cateid}).sort([['name_en','asc']]).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get learn by id
// Param learnid: id of learn
// Param callback: funtion callback
//--------------------------------
exports.getLearnByID = function(learnid, callback){
	learnDB.findOne({_id:new ObjectID(learnid)}, function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get list learn
// Param page: curent page
// Param offset: offset setting
// Param callback: funtion callback
//--------------------------------
exports.getListLearn = function(learncate, page, offset, callback){
	var iSkip = (page - 1) * offset;
	var iOffset = page * offset;
	learnDB.find({  "learncate" : learncate }).sort([['_id','desc']]).skip(iSkip).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get count list learn
// Param callback: funtion callback
//--------------------------------
exports.getCountListLearn = function(learncate, callback){
	learnDB.count({  "learncate" : learncate }, function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Delete learn
// Param callback: funtion callback
//--------------------------------
exports.deleteLearn = function(learnid, callback){
	learnDB.remove({ _id : new ObjectID(learnid) }, function(err,result){
		if(err)
			callback(err,'Can not delete location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get learn static
//--------------------------------
exports.getLearnStatic = function(callback){
	var result = {
					"alphabet_vn":[
						{"image":"http://123.30.130.198:3010/upload/v_a.jpg", "image1":"http://123.30.130.198:3010/upload/v_a0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_a8.jpg", "image1":"http://123.30.130.198:3010/upload/v_a80.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_a6.jpg", "image1":"http://123.30.130.198:3010/upload/v_a60.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_b.jpg", "image1":"http://123.30.130.198:3010/upload/v_b0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_c.jpg", "image1":"http://123.30.130.198:3010/upload/v_c0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_d.jpg", "image1":"http://123.30.130.198:3010/upload/v_d0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_d9.jpg", "image1":"http://123.30.130.198:3010/upload/v_d90.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_e.jpg", "image1":"http://123.30.130.198:3010/upload/v_e0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_e6.jpg", "image1":"http://123.30.130.198:3010/upload/v_e60.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_g.jpg", "image1":"http://123.30.130.198:3010/upload/v_g0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_h.jpg", "image1":"http://123.30.130.198:3010/upload/v_h0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_i.jpg", "image1":"http://123.30.130.198:3010/upload/v_i0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_k.jpg", "image1":"http://123.30.130.198:3010/upload/v_k0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_l.jpg", "image1":"http://123.30.130.198:3010/upload/v_l0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_m.jpg", "image1":"http://123.30.130.198:3010/upload/v_m0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_n.jpg", "image1":"http://123.30.130.198:3010/upload/v_n0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_o.jpg", "image1":"http://123.30.130.198:3010/upload/v_o0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_o6.jpg", "image1":"http://123.30.130.198:3010/upload/v_o60.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_o7.jpg", "image1":"http://123.30.130.198:3010/upload/v_o70.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_p.jpg", "image1":"http://123.30.130.198:3010/upload/v_p0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_q.jpg", "image1":"http://123.30.130.198:3010/upload/v_q0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_r.jpg", "image1":"http://123.30.130.198:3010/upload/v_r0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_s.jpg", "image1":"http://123.30.130.198:3010/upload/v_s0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_t.jpg", "image1":"http://123.30.130.198:3010/upload/v_t0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_u.jpg", "image1":"http://123.30.130.198:3010/upload/v_u0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_u7.jpg", "image1":"http://123.30.130.198:3010/upload/v_u70.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_v.jpg", "image1":"http://123.30.130.198:3010/upload/v_v0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_x.jpg", "image1":"http://123.30.130.198:3010/upload/v_x0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v_y.jpg", "image1":"http://123.30.130.198:3010/upload/v_y0.jpg"}
					],
					"alphabet_en":[
						{"image":"http://123.30.130.198:3010/upload/a.jpg", "image1":"http://123.30.130.198:3010/upload/a0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/b.jpg", "image1":"http://123.30.130.198:3010/upload/b0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/c.jpg", "image1":"http://123.30.130.198:3010/upload/c0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/d.jpg", "image1":"http://123.30.130.198:3010/upload/d0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/e.jpg", "image1":"http://123.30.130.198:3010/upload/e0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/f.jpg", "image1":"http://123.30.130.198:3010/upload/f0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/g.jpg", "image1":"http://123.30.130.198:3010/upload/g0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/h.jpg", "image1":"http://123.30.130.198:3010/upload/h0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/i.jpg", "image1":"http://123.30.130.198:3010/upload/i0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/j.jpg", "image1":"http://123.30.130.198:3010/upload/j0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/k.jpg", "image1":"http://123.30.130.198:3010/upload/k0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/l.jpg", "image1":"http://123.30.130.198:3010/upload/l0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/m.jpg", "image1":"http://123.30.130.198:3010/upload/m0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/n.jpg", "image1":"http://123.30.130.198:3010/upload/n0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/o.jpg", "image1":"http://123.30.130.198:3010/upload/o0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/p.jpg", "image1":"http://123.30.130.198:3010/upload/p0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/q.jpg", "image1":"http://123.30.130.198:3010/upload/q0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/r.jpg", "image1":"http://123.30.130.198:3010/upload/r0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/s.jpg", "image1":"http://123.30.130.198:3010/upload/s0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/t.jpg", "image1":"http://123.30.130.198:3010/upload/t0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/u.jpg", "image1":"http://123.30.130.198:3010/upload/u0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/v.jpg", "image1":"http://123.30.130.198:3010/upload/v0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/w.jpg", "image1":"http://123.30.130.198:3010/upload/w0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/x.jpg", "image1":"http://123.30.130.198:3010/upload/x0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/y.jpg", "image1":"http://123.30.130.198:3010/upload/y0.jpg"},
						{"image":"http://123.30.130.198:3010/upload/z.jpg", "image1":"http://123.30.130.198:3010/upload/z0.jpg"}
					],
					"color":[
						{"vn":"Màu đỏ", "en":"Red", "image":"http://123.30.130.198:3010/upload/mau_do.jpg"},
						{"vn":"Màu xanh dương", "en":"Blue", "image":"http://123.30.130.198:3010/upload/mau_xanh_duong.jpg"},
						{"vn":"Màu xanh lá", "en":"Green", "image":"http://123.30.130.198:3010/upload/mau_xanh_la.jpg"},
						{"vn":"Màu vàng", "en":"Yellow", "image":"http://123.30.130.198:3010/upload/mau_vang.jpg"},
						{"vn":"Màu tím", "en":"Purple", "image":"http://123.30.130.198:3010/upload/mau_tim.jpg"},
						{"vn":"Màu xám", "en":"Grey", "image":"http://123.30.130.198:3010/upload/mau_xam.jpg"},
						{"vn":"Màu đen", "en":"Black", "image":"http://123.30.130.198:3010/upload/mau_den.jpg"},
						{"vn":"Màu hồng", "en":"Pink", "image":"http://123.30.130.198:3010/upload/mau_hong.jpg"},
						{"vn":"Màu cam", "en":"Orange", "image":"http://123.30.130.198:3010/upload/mau_cam.jpg"},
						{"vn":"Màu nâu", "en":"Brown", "image":"http://123.30.130.198:3010/upload/mau_nau.jpg"},
						{"vn":"Màu trắng", "en":"White", "image":"http://123.30.130.198:3010/upload/mau_trang.jpg"},
						{"vn":"Màu lam", "en":"Cyan", "image":"http://123.30.130.198:3010/upload/mau_xanh_lam.jpg"}
					],
					"furniture":[
						{"vn":"Quần đùi", "en":"Short", "image":"http://123.30.130.198:3010/upload/1.quan_dui.jpg"},
						{"vn":"Cái nơ", "en":"Tie", "image":"http://123.30.130.198:3010/upload/10.cai_no.jpg"},
						{"vn":"Bình nước", "en":"Bottle", "image":"http://123.30.130.198:3010/upload/11.binh_nuoc.jpg"},
						{"vn":"Quần dài", "en":"Trousers", "image":"http://123.30.130.198:3010/upload/2.quan_dai.jpg"},
						{"vn":"Áo thun", "en":"Pull", "image":"http://123.30.130.198:3010/upload/3.ao_thun.jpg"},
						{"vn":"Áo sơ-mi", "en":"Shirt", "image":"http://123.30.130.198:3010/upload/4.ao_so_mi.jpg"},
						{"vn":"Váy dài", "en":"Dress", "image":"http://123.30.130.198:3010/upload/5.vay_dai.jpg"},
						{"vn":"Đôi dép", "en":"Sandals", "image":"http://123.30.130.198:3010/upload/6.doi_dep.png"},
						{"vn":"Đôi giày", "en":"Shoes", "image":"http://123.30.130.198:3010/upload/7.doi_giay.jpg"},
						{"vn":"Mắt kính", "en":"Glasses", "image":"http://123.30.130.198:3010/upload/8.mat_kinh.jpg"},
						{"vn":"Cái nón", "en":"Hat", "image":"http://123.30.130.198:3010/upload/9.cai_non.jpg"},
						{"vn":"Cái nồi", "en":"Pot", "image":"http://123.30.130.198:3010/upload/1.cai_noi.jpg"},
						{"vn":"Cái chảo", "en":"Pan", "image":"http://123.30.130.198:3010/upload/2.cai_chao.jpg"},
						{"vn":"Cái muỗng", "en":"Spoon", "image":"http://123.30.130.198:3010/upload/3.cai_muong.jpg"},
						{"vn":"Cái chén", "en":"Small bowl", "image":"http://123.30.130.198:3010/upload/4.cai_chen.jpg"},
						{"vn":"Đôi đũa", "en":"Chopstick", "image":"http://123.30.130.198:3010/upload/5.doi_dua.jpg"},
						{"vn":"Cái ghế", "en":"Chair", "image":"http://123.30.130.198:3010/upload/1.cai_ghe.jpg"},
						{"vn":"Cái bàn", "en":"Table", "image":"http://123.30.130.198:3010/upload/2.cai_ban.jpg"},
						{"vn":"Chìa khóa", "en":"Key", "image":"http://123.30.130.198:3010/upload/3.chia_khoa.jpg"},
						{"vn":"Cái ly", "en":"Glass", "image":"http://123.30.130.198:3010/upload/4.cai_ly.jpg"},
						{"vn":"Điện thoại", "en":"Telephone", "image":"http://123.30.130.198:3010/upload/5.dien_thoai.jpg"},
						{"vn":"Đồng hồ", "en":"Clock", "image":"http://123.30.130.198:3010/upload/6.dong_ho.jpg"},
						{"vn":"Ti-vi", "en":"Television", "image":"http://123.30.130.198:3010/upload/7.tivi.jpg"},
						{"vn":"Cái giường", "en":"Bed", "image":"http://123.30.130.198:3010/upload/1.cai_giuong.jpg"},
						{"vn":"Cái gối", "en":"Pillow", "image":"http://123.30.130.198:3010/upload/2.cai_goi.jpg"},
						{"vn":"Cái chân", "en":"Leg", "image":"http://123.30.130.198:3010/upload/3.cai_chan.jpg"},
						{"vn":"Tủ quần áo", "en":"Cabinet", "image":"http://123.30.130.198:3010/upload/4.tu_quan_ao.jpg"},
						{"vn":"Bàn chải", "en":"Tooth brush", "image":"http://123.30.130.198:3010/upload/1.ban_chai_danh_rang.jpg"},
						{"vn":"Kem đánh răng", "en":"Toothpaste", "image":"http://123.30.130.198:3010/upload/2.kem_danh_rang.jpg"},
						{"vn":"Sữa tắm", "en":"Shower cream", "image":"http://123.30.130.198:3010/upload/3.sua_tam.jpg"},
						{"vn":"Dầu gội đầu", "en":"Shampoo", "image":"http://123.30.130.198:3010/upload/4.dau_goi_dau.jpg"},
						{"vn":"Khăn mặt", "en":"Towel", "image":"http://123.30.130.198:3010/upload/5.khan_mat.jpg"},
						{"vn":"Cái lược", "en":"Comb", "image":"http://123.30.130.198:3010/upload/6.cai_luoc.jpg"},
						{"vn":"Cái gương", "en":"Mirror", "image":"http://123.30.130.198:3010/upload/7.cai_guong.jpg"},
						{"vn":"Quyển tập", "en":"Notebook", "image":"http://123.30.130.198:3010/upload/1.quyen_tap.jpg"},
						{"vn":"Xe ô-tô", "en":"Car", "image":"http://123.30.130.198:3010/upload/10.xe_oto.jpg"},
						{"vn":"Xe máy", "en":"Motorbike", "image":"http://123.30.130.198:3010/upload/11.xe_may.jpg"},
						{"vn":"Cuốn sách", "en":"Book", "image":"http://123.30.130.198:3010/upload/2.cuon_sach.jpg"},
						{"vn":"Cây thước", "en":"Ruler", "image":"http://123.30.130.198:3010/upload/3.cay_thuoc.jpg"},
						{"vn":"Cục gôm", "en":"Eraser", "image":"http://123.30.130.198:3010/upload/4.cuc_gom.jpg"},
						{"vn":"Bút chì", "en":"Pencil", "image":"http://123.30.130.198:3010/upload/5.but_chi.jpg"},
						{"vn":"Bút máy", "en":"Pen", "image":"http://123.30.130.198:3010/upload/6.but_may.jpg"},
						{"vn":"Hộp bút", "en":"Case", "image":"http://123.30.130.198:3010/upload/7.hop_but.jpg"},
						{"vn":"Quả bóng", "en":"Ball", "image":"http://123.30.130.198:3010/upload/8.qua_bong.jpg"},
						{"vn":"Xe đạp", "en":"Bicycle", "image":"http://123.30.130.198:3010/upload/9.xe_dap.jpg"}
					],
					"vegetable":[
						{"vn":"Quả chuối", "en":"Banana", "image":"http://123.30.130.198:3010/upload/1.qua_chuoi.jpg"},
						{"vn":"Quả chanh", "en":"Lemon", "image":"http://123.30.130.198:3010/upload/10.qua_chanh.jpg"},
						{"vn":"Quả bưởi", "en":"Pomelo", "image":"http://123.30.130.198:3010/upload/11.qua_buoi.jpg"},
						{"vn":"Quả wiki", "en":"Wiki", "image":"http://123.30.130.198:3010/upload/12.qua_kiwi.jpg"},
						{"vn":"Quả mãng cầu", "en":"Sugar apple", "image":"http://123.30.130.198:3010/upload/13.qua_mang_cau.jpg"},
						{"vn":"Măng cụt", "en":"Mangosteen", "image":"http://123.30.130.198:3010/upload/14.qua_mang_cut.jpg"},
						{"vn":"Quả nhãn", "en":"Longan", "image":"http://123.30.130.198:3010/upload/15.qua_nhan.jpg"},
						{"vn":"Quả mít", "en":"Jack fruit", "image":"http://123.30.130.198:3010/upload/16.qua_mit.jpg"},
						{"vn":"Quả chôm chôm", "en":"Rambutan", "image":"http://123.30.130.198:3010/upload/17.qua_chom_chom.jpg"},
						{"vn":"Quả khế", "en":"Star fruit", "image":"http://123.30.130.198:3010/upload/18.qua_khe.jpg"},
						{"vn":"Quả đu đủ", "en":"Papaya", "image":"http://123.30.130.198:3010/upload/19.qua_du_du.jpg"},
						{"vn":"Quả đào", "en":"Peach", "image":"http://123.30.130.198:3010/upload/2.qua_dao.jpg"},
						{"vn":"Quả lựu", "en":"Pomegranate", "image":"http://123.30.130.198:3010/upload/20.qua_luu.jpg"},
						{"vn":"Quả bơ", "en":"Avocado", "image":"http://123.30.130.198:3010/upload/21.qua_bo.jpg"},
						{"vn":"Quả sầu riêng", "en":"Durian", "image":"http://123.30.130.198:3010/upload/22.qua_sau_rieng.jpg"},
						{"vn":"Quả hồng", "en":"Persimmon", "image":"http://123.30.130.198:3010/upload/23.qua_hong.jpg"},
						{"vn":"Quả mận", "en":"Plum", "image":"http://123.30.130.198:3010/upload/24.qua_man.jpg"},
						{"vn":"Thanh long", "en":"Dragon fruit", "image":"http://123.30.130.198:3010/upload/25.qua_thanh__long.jpg"},
						{"vn":"Quả ổi", "en":"Guava", "image":"http://123.30.130.198:3010/upload/26.qua_oi.jpg"},
						{"vn":"Quả dâu tây", "en":"Strawberry", "image":"http://123.30.130.198:3010/upload/3.qua_dau_tay.jpg"},
						{"vn":"Quả dừa", "en":"Coconut", "image":"http://123.30.130.198:3010/upload/4.qua_dua.jpg"},
						{"vn":"Quả lê", "en":"Pear", "image":"http://123.30.130.198:3010/upload/5.qua_le.jpg"},
						{"vn":"Quả nho", "en":"Grape", "image":"http://123.30.130.198:3010/upload/6.qua_nho.jpg"},
						{"vn":"Quả táo", "en":"Apple", "image":"http://123.30.130.198:3010/upload/7.qua_tao.jpg"},
						{"vn":"Quả dưa hấu", "en":"Watermelon", "image":"http://123.30.130.198:3010/upload/8.qua_dua_hau.jpg"},
						{"vn":"Quả vải", "en":"Lychee", "image":"http://123.30.130.198:3010/upload/9.qua_vai.jpg"},
						{"vn":"Chanh dây", "en":"Passion fruit", "image":"http://123.30.130.198:3010/upload/chanh_day.jpg"},
						{"vn":"Chanh vàng", "en":"Lemon", "image":"http://123.30.130.198:3010/upload/chanh_vang.jpg"},
						{"vn":"Dưa vàng", "en":"Melon", "image":"http://123.30.130.198:3010/upload/dua_vang.jpg"},
						{"vn":"Mãn cầu xiêm", "en":"Soursop", "image":"http://123.30.130.198:3010/upload/mang_cau_xiem.jpg"},
						{"vn":"Quả cóc", "en":"Ambarella", "image":"http://123.30.130.198:3010/upload/qua_coc.jpg"},
						{"vn":"Quả hồng xiêm", "en":"Sapodila", "image":"http://123.30.130.198:3010/upload/qua_hong_xiem.jpg"},
						{"vn":"Quả mận", "en":"Plum", "image":"http://123.30.130.198:3010/upload/qua_man.jpg"},
						{"vn":"Quả me", "en":"Tamarind", "image":"http://123.30.130.198:3010/upload/qua_me.jpg"},
						{"vn":"Quả quất", "en":"Kumquat", "image":"http://123.30.130.198:3010/upload/qua_quat.jpg"},
						{"vn":"Quả quýt", "en":"Mandarin", "image":"http://123.30.130.198:3010/upload/qua_quyt.jpg"},
						{"vn":"Quả sung", "en":"Fig", "image":"http://123.30.130.198:3010/upload/qua_sung.jpg"},
						{"vn":"Quýt xanh", "en":"Mandarin", "image":"http://123.30.130.198:3010/upload/quyt_xanh.jpg"},
						{"vn":"Vú sữa", "en":"Caimito", "image":"http://123.30.130.198:3010/upload/vu_sua.jpg"},
						{"vn":"Cải thảo", "en":"Brassica", "image":"http://123.30.130.198:3010/upload/1.cai_thao.jpg"},
						{"vn":"Quả ớt", "en":"Chilli", "image":"http://123.30.130.198:3010/upload/10.qua_ot.jpg"},
						{"vn":"Quả dưa", "en":"Melon", "image":"http://123.30.130.198:3010/upload/11.qua_dua.jpg"},
						{"vn":"Khoai tây", "en":"Potato", "image":"http://123.30.130.198:3010/upload/12.khoai_tay.jpg"},
						{"vn":"Củ tỏi", "en":"Garlic", "image":"http://123.30.130.198:3010/upload/13.cu_toi.jpg"},
						{"vn":"Khoai lang", "en":"Sweet potato", "image":"http://123.30.130.198:3010/upload/14.khoai_lang.jpg"},
						{"vn":"Cà-rốt", "en":"Carrot", "image":"http://123.30.130.198:3010/upload/15.cu_ca_rot.jpg"},
						{"vn":"Củ su hào", "en":"Cabbage turnip", "image":"http://123.30.130.198:3010/upload/16.cu_su_hao.jpg"},
						{"vn":"Bí đỏ", "en":"Pumpkin", "image":"http://123.30.130.198:3010/upload/17.bi_do.jpg"},
						{"vn":"Bí xanh", "en":"Courgette", "image":"http://123.30.130.198:3010/upload/18.bi_xanh.jpg"},
						{"vn":"Rau dền", "en":"Spinach", "image":"http://123.30.130.198:3010/upload/19.rau_den.jpg"},
						{"vn":"Cà tím", "en":"Eggplant", "image":"http://123.30.130.198:3010/upload/2.ca_tim.jpg"},
						{"vn":"Rau mùng tơi", "en":"Malabar nightshade", "image":"http://123.30.130.198:3010/upload/20.rau_mong_toi.jpg"},
						{"vn":"Củ lạc", "en":"Peanut", "image":"http://123.30.130.198:3010/upload/21.cu_lac.jpg"},
						{"vn":"Đậu bắp", "en":"Okra", "image":"http://123.30.130.198:3010/upload/22.dau_bap.jpg"},
						{"vn":"Su su", "en":"Chayote", "image":"http://123.30.130.198:3010/upload/23.cu_su_su.jpg"},
						{"vn":"Củ dền", "en":"Red turnip", "image":"http://123.30.130.198:3010/upload/24.cu_den.jpg"},
						{"vn":"Củ gừng", "en":"Ginger", "image":"http://123.30.130.198:3010/upload/25.cu_gung.jpg"},
						{"vn":"Củ cải trắng", "en":"Radish", "image":"http://123.30.130.198:3010/upload/26.cu_cai_trang.jpg"},
						{"vn":"Cà chua", "en":"Tomato", "image":"http://123.30.130.198:3010/upload/3.ca_chua.jpg"},
						{"vn":"Dưa chuột", "en":"Cucumber", "image":"http://123.30.130.198:3010/upload/4.dua_chuot.jpg"},
						{"vn":"Bắp cải", "en":"Cabbage", "image":"http://123.30.130.198:3010/upload/5.bap_cai.jpg"},
						{"vn":"Nấm hương", "en":"Shiitake", "image":"http://123.30.130.198:3010/upload/6.nam_huong.jpg"},
						{"vn":"Bắp ngô", "en":"Corn", "image":"http://123.30.130.198:3010/upload/7.bap_ngo.jpg"},
						{"vn":"Hành tây", "en":"Onion", "image":"http://123.30.130.198:3010/upload/8.hanh_tay.jpg"},
						{"vn":"Quả mướp", "en":"Loofah", "image":"http://123.30.130.198:3010/upload/9.qua_muop.jpg"},
						{"vn":"Bông cải trắng", "en":"Cauliflower", "image":"http://123.30.130.198:3010/upload/bong_cai_trang.jpg"},
						{"vn":"Bông cải xanh", "en":"Cauliflower", "image":"http://123.30.130.198:3010/upload/bong_cai_xanh.jpg"},
						{"vn":"Cải bẹ xanh", "en":"Mustard", "image":"http://123.30.130.198:3010/upload/cai_be_xanh.jpg"},
						{"vn":"Cái thìa", "en":"Spoon", "image":"http://123.30.130.198:3010/upload/cai_thia.jpg"},
						{"vn":"Cái xoong", "en":"Pot", "image":"http://123.30.130.198:3010/upload/cai_xoong.jpg"},
						{"vn":"Cần tây", "en":"Celery", "image":"http://123.30.130.198:3010/upload/can_tay.jpg"},
						{"vn":"Đậu cô-ve", "en":"Green bean", "image":"http://123.30.130.198:3010/upload/dau_cove.jpg"},
						{"vn":"Đậu đũa", "en":"Cowpea", "image":"http://123.30.130.198:3010/upload/dau_dua.jpg"},
						{"vn":"Đậu Hà Lan", "en":"Pea", "image":"http://123.30.130.198:3010/upload/dau_ha_lan.jpg"},
						{"vn":"Hành lá", "en":"Onion", "image":"http://123.30.130.198:3010/upload/hanh_la.jpg"},
						{"vn":"Củ từ", "en":"Yam", "image":"http://123.30.130.198:3010/upload/khoai_tu.jpg"},
						{"vn":"Măng tây", "en":"Asparagus", "image":"http://123.30.130.198:3010/upload/mang_tay.jpg"},
						{"vn":"Ớt ngọt", "en":"Sweet pepper", "image":"http://123.30.130.198:3010/upload/ot_ngot.jpg"},
						{"vn":"Quả bầu", "en":"Calabash", "image":"http://123.30.130.198:3010/upload/qua_bau.jpg"},
						{"vn":"Rau cần", "en":"Dropwort", "image":"http://123.30.130.198:3010/upload/rau_can.jpg"}
					],
					"animal":[
						{"vn":"Chó", "en":"Dog", "image":"http://123.30.130.198:3010/upload/1.con_cho.jpg"},
						{"vn":"Tôm", "en":"Shrimp", "image":"http://123.30.130.198:3010/upload/10.con_tom.jpg"},
						{"vn":"Cua", "en":"Crab", "image":"http://123.30.130.198:3010/upload/11.con_cua.jpg"},
						{"vn":"Chim", "en":"Bird", "image":"http://123.30.130.198:3010/upload/12.con_chim.jpg"},
						{"vn":"Bướm", "en":"Butterfly", "image":"http://123.30.130.198:3010/upload/13.con_buom_buom.jpg"},
						{"vn":"Chuồn chuồn", "en":"Dragonfly", "image":"http://123.30.130.198:3010/upload/14.con_chuon_chuon.jpg"},
						{"vn":"Ong", "en":"Bee", "image":"http://123.30.130.198:3010/upload/15.con_ong.jpg"},
						{"vn":"Chuột", "en":"Mouse", "image":"http://123.30.130.198:3010/upload/16.con_chuot.jpg"},
						{"vn":"Ngựa", "en":"Horse", "image":"http://123.30.130.198:3010/upload/17.con_ngua.jpg"},
						{"vn":"Nhện", "en":"Spider", "image":"http://123.30.130.198:3010/upload/17.con_nhen.jpg"},
						{"vn":"Muỗi", "en":"Mosquito", "image":"http://123.30.130.198:3010/upload/18.con_muoi.jpg"},
						{"vn":"Gấu", "en":"Bear", "image":"http://123.30.130.198:3010/upload/19.con_gau.jpg"},
						{"vn":"Ruồi", "en":"Fly", "image":"http://123.30.130.198:3010/upload/19.con_ruoi.jpg"},
						{"vn":"Mèo", "en":"Cat", "image":"http://123.30.130.198:3010/upload/2.con_meo.jpg"},
						{"vn":"Ếch", "en":"Frog", "image":"http://123.30.130.198:3010/upload/20.con_ech.jpg"},
						{"vn":"Thỏ", "en":"Rabbit", "image":"http://123.30.130.198:3010/upload/21.con_tho.jpg"},
						{"vn":"Nhím", "en":"Porcupine", "image":"http://123.30.130.198:3010/upload/22.con_nhim.jpg"},
						{"vn":"Hà mã", "en":"Hippopotamus", "image":"http://123.30.130.198:3010/upload/23.con_ha_ma.jpg"},
						{"vn":"Voi", "en":"Elephant", "image":"http://123.30.130.198:3010/upload/23.con_voi.jpg"},
						{"vn":"Khỉ", "en":"Monkey", "image":"http://123.30.130.198:3010/upload/24.con_khi.jpg"},
						{"vn":"Hươu", "en":"Deer", "image":"http://123.30.130.198:3010/upload/25.con_huou.jpg"},
						{"vn":"Nai", "en":"Stag", "image":"http://123.30.130.198:3010/upload/26.con_nai.jpg"},
						{"vn":"Hổ", "en":"Tiger", "image":"http://123.30.130.198:3010/upload/27.con_ho.jpg"},
						{"vn":"Sư tử", "en":"Lion", "image":"http://123.30.130.198:3010/upload/28.con_su_tu.jpg"},
						{"vn":"Sóc", "en":"Squire", "image":"http://123.30.130.198:3010/upload/29.con_soc.jpg"},
						{"vn":"Gà", "en":"Chicken", "image":"http://123.30.130.198:3010/upload/3.con_ga.jpg"},
						{"vn":"Vịt", "en":"Duck", "image":"http://123.30.130.198:3010/upload/4.con_vit.jpg"},
						{"vn":"Heo", "en":"Pig", "image":"http://123.30.130.198:3010/upload/5.con_heo.jpg"},
						{"vn":"Bò", "en":"Bull", "image":"http://123.30.130.198:3010/upload/6.con_bo.jpg"},
						{"vn":"Trâu", "en":"Buffalo", "image":"http://123.30.130.198:3010/upload/7.con_trau.jpg"},
						{"vn":"Dê", "en":"Goat", "image":"http://123.30.130.198:3010/upload/8.con_de.jpg"},
						{"vn":"Cá", "en":"Fish", "image":"http://123.30.130.198:3010/upload/9.con_ca.jpg"},
						{"vn":"Cá heo", "en":"Dolphin", "image":"http://123.30.130.198:3010/upload/con_ca_heo.jpg"},
						{"vn":"Châu chấu", "en":"Grass hopper", "image":"http://123.30.130.198:3010/upload/con_chau_chau.jpg"},
						{"vn":"Cừu", "en":"Sheep", "image":"http://123.30.130.198:3010/upload/con_cuu.jpg"},
						{"vn":"Dế", "en":"Cricket", "image":"http://123.30.130.198:3010/upload/con_de.jpg"},
						{"vn":"Gián", "en":"Cockroach", "image":"http://123.30.130.198:3010/upload/con_gian.jpg"},
						{"vn":"Kiến", "en":"Ant", "image":"http://123.30.130.198:3010/upload/con_kien.jpg"},
						{"vn":"Nghêu", "en":"Clamp", "image":"http://123.30.130.198:3010/upload/con_ngheu.jpg"},
						{"vn":"Rùa", "en":"Turtle", "image":"http://123.30.130.198:3010/upload/con_rua.jpg"}
					]
	};

	callback(null,result);
}