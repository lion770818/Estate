//get home page
//功能是調用模板解析引擎，並傳入一個對象作為參數，這個對象只有一個屬性，即 title: 'Express'。
//index.ejs：index.ejs是模板文件，即路由/ index.js中調用的模板
//layout.ejs模板文件不是孤立展示的，默認情況下所有的模板都繼承自layout.ejs，<%- body %>部分才是獨特的內容，其他部分是共有的，可以看作是頁面框架。
//使用模板引擎：res.render，並將其產生的頁面直接返回给客户端

var util 		= require('util');
var async 		= require('async');  
var libmysql 	= require('./libmysql');  	// 自己做的mysql模組

var Count = 0;

var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' }, //控制台输出
    {
      type: 'file', //文件输出
      filename: 'logs/access.log', 
      maxLogSize: 1024,
      backups:3,
      category: 'normal' 
    }
  ]
});
var logger = log4js.getLogger('normal');
logger.setLevel('INFO');

//==============================================================================================
//執行手機註冊
exports.MblieRegister = function(req, res){
	logger.info('MblieRegister 進來...');
	logger.info('Account=' + req.body['Account']);
	logger.info('PassWord=' + req.body['PassWord']);
	logger.info('Name=' + req.body['Name']);

	var ret;
		 
	//logger.info('async.waterfall');
	async.waterfall([
					function (callback ) {logger.info('async.func1 傳遞參數用');return callback(null,req,libmysql.STATUS_REGISTER_MEMBER_DATA);},
					libmysql.SQL_PlayerInfoAuth,
					libmysql.SQL_PlayerInfoUIDGet,
					libmysql.SQL_PlayerInfoInster
				],
				function ( err, req2, Status )
				{
					logger.info('===async.finish');
					
					logger.info('====CallBackFunc_AnalysisAndDataGet err=' + err );
					logger.info('====CallBackFunc_AnalysisAndDataGet req2=' + req2 );
					logger.info('====CallBackFunc_AnalysisAndDataGet Status=' + Status );
					
					// 分析結果	
					ret = libmysql.AnalysisResult( err, req2, Status )
	
					var json_str = JSON.stringify(ret);
					logger.info('MblieRegister DTO_Response:' + json_str );
					res.send(json_str);			
				});

	logger.info('MblieRegister 離開等待async結果...');
}

//==============================================================================================
//執行手機登入
exports.MblieLogin = function(req, res){
	logger.info('MblieLogin 進來...');
	logger.info('UID=' + req.body['UID']);
	var UID = req.body['UID'];
	var ret;
	
	// 給他初始化
	logger.info('LoginState=' + req.body['LoginState']);
	//if( req.body['LoginState'] == 'undefined' )
	{
		 req.body['LoginState'] = 1;
		 logger.info('給他初始化 LoginState=' + req.body['LoginState']);
	}
	 
	logger.info('async.eachSeries');
	async.waterfall([
					function (callback ) {logger.info('async.func1 傳遞參數用');return callback(null,req, libmysql.STATUS_LOGIN);},
					libmysql.SQL_PlayerInfoAuth2,
					libmysql.PlayerInfoUpdateScore
				],
				function ( err, req2, Status, rows )
				{
					logger.info('===async.finish');
					
					logger.info('====CallBackFunc_AnalysisAndDataGet err=' + err );
					logger.info('====CallBackFunc_AnalysisAndDataGet req2=' + req2 );
					logger.info('====CallBackFunc_AnalysisAndDataGet Status=' + Status );
										
					// 分析結果	
					ret = libmysql.AnalysisResult( err, req2, Status, rows );
	
					var json_str = JSON.stringify(ret);
					logger.info('MblieLogin DTO_Response:' + json_str );
					res.send(json_str);			
				});

	logger.info('MblieLogin 離開等待async結果...');
}

//==============================================================================================
//執行手機登出
exports.MblieLogout = function(req, res){
	logger.info('MblieLogout 進來...');
	logger.info('UID=' + req.body['UID']);
	var UID = req.body['UID'];
	var ret;
	
	// 給他初始化
	logger.info('LoginState=' + req.body['LoginState']);
	//if( req.body['LoginState'] == 'undefined' )
	{
		 req.body['LoginState'] = 0;
		 logger.info('給他初始化 LoginState=' + req.body['LoginState']);
	}
	 
	logger.info('async.eachSeries');
	async.waterfall([
					function (callback ) {logger.info('async.func1 傳遞參數用');return callback(null,req, libmysql.STATUS_LOGOUT);},
					libmysql.SQL_PlayerInfoGet,
					libmysql.PlayerInfoUpdateScore
				],
				function ( err, req2, Status )
				{
					logger.info('===async.finish');
					
					logger.info('====CallBackFunc_AnalysisAndDataGet err=' + err );
					logger.info('====CallBackFunc_AnalysisAndDataGet req2=' + req2 );
					logger.info('====CallBackFunc_AnalysisAndDataGet Status=' + Status );
					
					// 分析結果	
					ret = libmysql.AnalysisResult( err, req2, Status )
	
					var json_str = JSON.stringify(ret);
					logger.info('MblieLogout DTO_Response:' + json_str );
					res.send(json_str);			
				});

	logger.info('MblieLogout 離開等待async結果...');
}


//==============================================================================================
//執行手機新增員工資料
exports.MblieAddMember = function(req, res){
	logger.info('MblieAddMember 進來...');
	logger.info('UID=' + req.body['UID']);
	
	var UID = req.body['UID'];
	var ret;

	async.waterfall([
					function (callback ) {logger.info('async.func1 傳遞參數用');return callback(null,req, libmysql.STATUS_ADD_MEMBER_DATA);},
					libmysql.SQL_PlayerInfoAuth,
					libmysql.SQL_PlayerInfoUIDGet,
					libmysql.SQL_PlayerInfoInster
				],
				function ( err, req2, Status )
				{
					var message = 'unknow';
					
					logger.info('====CallBackFunc_AnalysisAndDataGet err=' + err );
					logger.info('====CallBackFunc_AnalysisAndDataGet req2=' + req2 );
					logger.info('====CallBackFunc_AnalysisAndDataGet Status=' + Status );
					
					// 分析結果	
					ret = libmysql.AnalysisResult( err, req2, Status )
	
					var json_str = JSON.stringify(ret);
					logger.info('MblieAddMember DTO_Response:' + json_str );
					res.send(json_str);
					//return ret;				
				});

	logger.info('MblieAddMember 離開等待async結果...');

	
}

//==============================================================================================
//執行手機刪除員工資料
exports.MblieDelMember = function(req, res){
	logger.info('MblieDelMember 進來...');

	var UID = req.body['UID'];
	var ret;
	logger.info('async.eachSeries');
	
	//async.eachSeries(
	async.waterfall([
					function (callback ) {logger.info('async.func1 傳遞參數用');return callback(null,req, libmysql.STATUS_DEL_MEMBER_DATA);},
					libmysql.SQL_PlayerInfoAuth,
					libmysql.SQL_PlayerInfoDelete
				],
				function ( err, req2, Status )
				{
					var message = 'unknow';
					
					logger.info('====CallBackFunc_AnalysisAndDataGet err=' + err );
					logger.info('====CallBackFunc_AnalysisAndDataGet req2=' + req2 );
					logger.info('====CallBackFunc_AnalysisAndDataGet Status=' + Status );
					
					// 分析結果	
					ret = libmysql.AnalysisResult( err, req2, Status )
	
					var json_str = JSON.stringify(ret);
					logger.info('MblieDelMember DTO_Response:' + json_str );
					res.send(json_str);
					//return ret;				
				});

	
	logger.info('MblieDelMember 離開等待async結果...');
}


//==============================================================================================
//執行手機更新員工資料
exports.MblieUpdateMember = function(req, res){
	logger.info('MblieUpdateMember 進來...');

	var UID = req.body['UID'];
	var ret;
	logger.info('async.eachSeries');
	
	//async.eachSeries(
	async.waterfall([
					function (callback ) {logger.info('async.func1 傳遞參數用');return callback(null,req, libmysql.STATUS_UPDATE_MEMBER_DATA);},
					libmysql.SQL_PlayerInfoAuth,
					libmysql.SQL_PlayerInfoUpdate
				],
				function ( err, req2, Status )
				{
					var message = 'unknow';
					
					logger.info('====CallBackFunc_AnalysisAndDataGet err=' + err );
					logger.info('====CallBackFunc_AnalysisAndDataGet req2=' + req2 );
					logger.info('====CallBackFunc_AnalysisAndDataGet Status=' + Status );
					
					// 分析結果	
					ret = libmysql.AnalysisResult( err, req2, Status )
	
					var json_str = JSON.stringify(ret);
					logger.info('MblieUpdateMember DTO_Response:' + json_str );
					res.send(json_str);
					//return ret;				
				});

	
	logger.info('MblieUpdateMember 離開等待async結果...');
}


//==============================================================================================
//執行手機取得員工資料
exports.MblieGetMember = function(req, res){
	logger.info('MblieGetMember 進來...');

	var UID = req.body['UID'];
	var ret;
	logger.info('async.eachSeries');
	
	//async.eachSeries(
	async.waterfall([
					function (callback ) {logger.info('async.func1 傳遞參數用');return callback(null,req, libmysql.STATUS_GET_MEMBER_DATA);},
					libmysql.SQL_PlayerInfoAuth,
					libmysql.SQL_PlayerInfoDataGet
				],
				function ( err, req2, Status, row )
				{
					var message = 'unknow';
					
					logger.info('====CallBackFunc_AnalysisAndDataGet err=' + err );
					logger.info('====CallBackFunc_AnalysisAndDataGet req2=' + req2 );
					logger.info('====CallBackFunc_AnalysisAndDataGet Status=' + Status );
					logger.info('====CallBackFunc_AnalysisAndDataGet row=' + row );
					
					// 分析結果	
					ret = libmysql.AnalysisResult( err, req2, Status, row );
	
					var json_str = JSON.stringify(ret);
					logger.info('MblieGetMember DTO_Response:' + json_str );
					res.send(json_str);
					//return ret;				
				});

	
	logger.info('MblieGetMember 離開等待async結果...');
}

//==============================================================================================
//執行手機 開始Spin
exports.MblieStartSpin = function(req, res){
	logger.info('MblieStartSpin 進來... Count=' + Count );

	var UID = req.body['UID'];
	var ret;
	logger.info('async.eachSeries');
	
	//async.eachSeries(
	async.waterfall([
					function (callback ) {logger.info('async.func1 傳遞參數用');return callback(null,req, libmysql.STATUS_START_SPIN);},
					libmysql.SQL_PlayerInfoAuth2,
					libmysql.SQL_StartSpinAndUpdateData,
					libmysql.SQL_GameLogInster
				],
				function ( err, req2, Status, row, getData2 )
				{
					var message = 'unknow';
					
					logger.info('====CallBackFunc_AnalysisAndDataGet err=' + err );
					logger.info('====CallBackFunc_AnalysisAndDataGet req2=' + req2 );
					logger.info('====CallBackFunc_AnalysisAndDataGet Status=' + Status );
					logger.info('====CallBackFunc_AnalysisAndDataGet row=' + row );
					logger.info('====CallBackFunc_AnalysisAndDataGet getData2=' + getData2 );
					
					// 分析結果	
					ret = libmysql.AnalysisResult( err, req2, Status, row, getData2 );
	
					var json_str = JSON.stringify(ret);
					logger.info('MblieStartSpin DTO_Response:' + json_str );
					res.send(json_str);
					//return ret;				
				});

	
	logger.info('MblieStartSpin 離開等待async結果...');
}


//==============================================================================================
//執行手機新增顧客資料
exports.MblieAddCustomer = function(req, res){
	logger.info('MblieAddCustomer 進來...');
	logger.info('UID=' + req.body['UID']);
	
	var UID = req.body['UID'];
	var ret;
	
	async.waterfall([
					function (callback ) {logger.info('async.func1 傳遞參數用');return callback(null,req, libmysql.STATUS_ADD_CUSTOMER_DATA);},
					libmysql.SQL_PlayerInfoAuth2,
					libmysql.SQL_CustomerInfoInster
				],
				function ( err, req2, Status, rows )
				{
					var message = 'unknow';
					
					logger.info('====CallBackFunc_AnalysisAndDataGet UID=' + UID );
					logger.info('====CallBackFunc_AnalysisAndDataGet err=' + err );
					logger.info('====CallBackFunc_AnalysisAndDataGet req2=' + req2 );
					logger.info('====CallBackFunc_AnalysisAndDataGet Status=' + Status );
					
					// 分析結果	
					ret = libmysql.AnalysisResult( err, req2, Status, rows )
	
					var json_str = JSON.stringify(ret);
					logger.info('MblieAddCustomer DTO_Response:' + json_str );
					res.send(json_str);
					//return ret;				
				});

	logger.info('MblieAddCustomer 離開等待async結果...');

	
}
//===============================================================================================================================================
//===============================================================================================================================================
//===============================================================================================================================================
//===============================================================================================================================================
//Mockup
var postList = [
	{ id: 1, name: "Apple", msg: "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the gre‬" },
	{ id: 2, name: "Zoe", msg: "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymph. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta." },
	{ id: 3, name: "Cathy", msg: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec qu" }
]; 
var count = postList.length;

//檢查使用者登入狀態
var isLogin = false;
var checkLoginStatus = function(req, res){
	isLogin = false;
	if(req.signedCookies.userid && req.signedCookies.password){
		isLogin = true;
	}
};

//首頁
exports.index = function(req, res){
	checkLoginStatus(req, res);
	res.render( 'index', {
		title : '歡迎來到 Microblog', 
		loginStatus : isLogin,
		posts : postList
	});	
};

//註冊頁面
exports.reg = function(req, res){
	checkLoginStatus(req, res);
	res.render( 'reg', {
		title : '註冊',
		loginStatus : isLogin
	});
};

//執行註冊
exports.doReg = function(req, res){
	if(req.body['password-repeat'] != req.body['password']){
		console.log('密碼輸入不一致。');
		console.log('第一次輸入的密碼：' + req.body['password']);
		console.log('第二次輸入的密碼：' + req.body['password-repeat']);
		return res.redirect('/reg');
	}
	else{
		//register success, redirect to index
		res.cookie('userid', req.body['username'], { path: '/', signed: true});		
		res.cookie('password', req.body['password'], { path: '/', signed: true });
		return res.redirect('/');
	}
};

//登入頁面
exports.login = function(req, res){
	checkLoginStatus(req, res);
	res.render( 'login', {
		title : '登入',
		loginStatus : isLogin
	});
};

//執行登入
exports.doLogin = function(req, res){
	if(req.body['password-repeat'] != req.body['password']){
		console.log('密碼輸入不一致。');
		console.log('第一次輸入的密碼：' + req.body['password']);
		console.log('第二次輸入的密碼：' + req.body['password-repeat']);
		return res.redirect('/reg');
	}
	else{
		//register success, redirect to index
		res.cookie('userid', req.body['username'], { path: '/', signed: true});		
		res.cookie('password', req.body['password'], { path: '/', signed: true });
		return res.redirect('/');
	}
};

//執行登出
exports.logout = function(req, res){
	res.clearCookie('userid', { path: '/' });
	res.clearCookie('password', { path: '/' });
	return res.redirect('/');
};

//發表訊息
exports.post = function(req, res){
	var element = { id: count++, name: req.signedCookies.userid, msg: req.body['post'] };
	postList.push(element);

	return res.redirect('/');	
};

//使用者頁面
exports.user = function(req, res){
	var userName = req.params.user;
	var userPosts = [];
	
	for (var i = 0; i < postList.length; i++) { 
		if(postList[i].name == userName){
			userPosts.push(postList[i]);
		}
	}
	
	checkLoginStatus(req, res);
	res.render( 'user', {
		title : userName + '的頁面',
		loginStatus : isLogin,
		posts : userPosts
	});
	
};
