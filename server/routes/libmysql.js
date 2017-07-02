//get home page
//功能是調用模板解析引擎，並傳入一個對象作為參數，這個對象只有一個屬性，即 title: 'Express'。
//index.ejs：index.ejs是模板文件，即路由/ index.js中調用的模板
//layout.ejs模板文件不是孤立展示的，默認情況下所有的模板都繼承自layout.ejs，<%- body %>部分才是獨特的內容，其他部分是共有的，可以看作是頁面框架。
//使用模板引擎：res.render，並將其產生的頁面直接返回给客户端

var util = require('util');
var async = require('async');  

// 亂數
var crypto = require('crypto');
var buf = crypto.randomBytes(32);
var math = require('math');

//載入MySQL模組
var mysql = require('mysql');  
//建立連線
connection = mysql.createConnection({
    host: '127.0.0.1',
	port: 3306,
    user: 'root',
    password: '1234',
    database: 'estate'
});
//開始連接
connection.connect();

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

//下列為自訂範圍值的亂數函式(最小值,最大值) floor 最亂
function usefloor(min,max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}

function useceil(min,max) {

	return Math.ceil(Math.random()*(max-min+1)+min-1);
}

function useround(min,max) {

	return Math.round(Math.random()*(max-min)+min);
}

// 錯誤代碼
var MESSAGE_CODE_SUCCESS = 0;
var MESSAGE_CODE_ERROR = -1;
var MESSAGE_CODE_UNKNOW = -2;
var MESSAGE_CODE_REREGISTER = -3; 
var MESSAGE_CODE_ERROR_SQL = -4; 
var MESSAGE_CODE_MEMBER_NO_FIND = -5; 	// 找不到會員
var MESSAGE_CODE_MEMBER_IS_FIND = -6; 	// 找到會員



// 流程狀態
var STATUS_ADD_MEMBER_DATA = 0;  				// 增加會員資料
var STATUS_UPDATE_MEMBER_DATA = 1;  			// 更新會員資料
var STATUS_GET_MEMBER_DATA = 2;  				// 取得會員資料
var STATUS_DEL_MEMBER_DATA = 3;  				// 刪除會員資料

var STATUS_REGISTER_MEMBER_DATA = 4;  			// 註冊會員資料
var STATUS_LOGIN = 5;  							// 登出
var STATUS_LOGOUT = 6;  						// 登入

var STATUS_START_SPIN = 8;						// 開始Spin

var STATUS_ADD_CUSTOMER_DATA = 9;				// 新增顧客

//================================================================================================================
//================================================================================================================
//================================================================================================================
// 創建類型爲 UserException 的物件
function UserException(message) {
  this.message = message;
  this.name = "UserException";
}


//==============================================================================================
// 回傳的結構
function DTO_Response(Code,Message,UID,Account,Data ) {
	this.Code = Code;
	this.Message = Message;
	this.UID = UID;
	this.Account = Account;
	this.Data = Data;
}
	
//==============================================================================================
// 回傳的結構
function DTO_Response2(Code,Message,UID,Account,Data, Game_Money ) {
	this.Code = Code;
	this.Message = Message;
	this.UID = UID;
	this.Account = Account;
	this.Data = Data;
	this.Game_Money = Game_Money;
}	
	
//==============================================================================================
// 會員的結構
function MemberDTO(UID,UUID,Name,PassWord,IdentityNumber,PhoneNumber,Salary,Bonus) {
	
	this.UID = UID;
	this.UUID = UUID;
	this.Name = Name;
	this.PassWord = PassWord;
	this.IdentityNumber = IdentityNumber;
	this.Address = Address;
	this.PhoneNumber = PhoneNumber;
	
	this.Salary = Salary;
	this.Bonus = Bonus;
}

//==============================================================================================
// 回傳的結構
function DTO_ResponseStartSpin(Code,Message,UID,Account,Data, Game_Money, Result, SpinResult, TotalBet, Win_Money ) {
	this.Code = Code;
	this.Message = Message;
	this.UID = UID;
	this.Account = Account;
	this.Data = Data;
	this.Game_Money = Game_Money;
	this.Result = Result;
	this.SpinResult = SpinResult;
	this.TotalBet = TotalBet;
	this.Win_Money = Win_Money;
}	
//==============================================================================================
//執行 取得玩家資料
function SQL_PlayerInfoGet( req, Status, CallBackFunc )
{
	logger.info('===SQL_PlayerInfoGet Status=' + Status );
	
	var UID = req.body['UID'];
	var SqlQuery = util.format('SELECT * FROM member where UID=%d;', UID);
	
	var bFine = false;

	logger.info('SqlQuery=' + SqlQuery );
		
	//接著就可以開始進行查詢
	connection.query(SqlQuery,function(error, rows){
		//檢查是否有錯誤
		if(error){
			
			logger.info('SQL_PlayerInfoGet SqlQuery error:' + error );
			CallBackFunc(MESSAGE_CODE_ERROR_SQL, req, Status );// end
			//throw error;
		}
		logger.info('mysql data:' + rows[0]); //2
		
		for (var i in rows) {
	
			var member = rows[i];
			if( member.UID == UID )
			{
				bFine = true;
				logger.info('有找到 UID=' + UID + " Name=" + member.Name  );
			}	
		}

		
		switch( Status)	
		{
			case STATUS_ADD_MEMBER_DATA:
			{// 新增會員
				if( bFine == true )
				{
					logger.info('有找到 結束步驟 uid:' + UID );
					CallBackFunc(MESSAGE_CODE_REREGISTER, req, Status );// end
					//CallBackFunc('error999', req, Status );
				}
				else
				{
					logger.info('沒找到 往下一個步驟去 UID=' + UID );
					CallBackFunc(null,req,Status);// next
				}		
			}
			break;
			
			case STATUS_DEL_MEMBER_DATA:
			{
				if( bFine == true )
				{
					logger.info('有找到 往下一個步驟去 UID=' + UID );
					CallBackFunc(null,req,Status);// next
				}
				else
				{
					logger.info('沒找到 結束步驟 uid:' + UID );
					CallBackFunc(MESSAGE_CODE_MEMBER_NO_FIND, req, Status );// end

				}				
			}
			break;
			
			case STATUS_LOGIN:
			case STATUS_LOGOUT:
			{
				if( bFine == true )
				{
					logger.info('有找到 往下一個步驟去 UID=' + UID );
					CallBackFunc(null,req,Status);// next

				}
				else
				{
					logger.info('沒找到 結束步驟 uid:' + UID );
					CallBackFunc(MESSAGE_CODE_MEMBER_NO_FIND, req, Status );// end
				}						
			}
			break;
				
			default:
				logger.info('warning SQL_PlayerInfoGet 跑到default 結束步驟 Name:' + Name + 'Status=' + Status );
				CallBackFunc(MESSAGE_CODE_UNKNOW, req, Status );// end
			break;
		}		

	});
}


//==============================================================================================
//執行 驗證玩家資料
function SQL_PlayerInfoAuth( req, Status, CallBackFunc )
{
	logger.info('===SQL_PlayerInfoAuth Status=' + Status );
	
	var UID = req.body['UID'];
	var Account = req.body['Account'];
	var PassWord = req.body['PassWord'];
	
	var SqlQuery = "";
	if( Status ==  STATUS_DEL_MEMBER_DATA )
		SqlQuery = util.format("SELECT * FROM member where UID=%d AND Account='%s' AND PassWord='%s';", UID, Account, PassWord );
	else
		SqlQuery = util.format("SELECT * FROM member where Account='%s' AND PassWord='%s';", Account, PassWord );
	
	var bFine = false;

	logger.info('SqlQuery=' + SqlQuery );
		
	//接著就可以開始進行查詢
	connection.query(SqlQuery,function(error, rows){
		//檢查是否有錯誤
		if(error){
			
			logger.info('SQL_PlayerInfoAuth SqlQuery error:' + error );
			CallBackFunc(MESSAGE_CODE_ERROR_SQL, req, Status );// end
			//throw error;
			return;
		}
		//logger.info('mysql data:' + rows[0]); //2
		
		for (var i in rows) {
	
			var member = rows[i];
			if( member.Account == Account && member.PassWord == PassWord )
			{
				bFine = true;
				logger.info('有找到 Account=' + Account + " PassWord=" + member.PassWord  );
			}	
		}

		
		switch( Status )	
		{
			case STATUS_REGISTER_MEMBER_DATA:
			case STATUS_ADD_MEMBER_DATA:
			{// 新增會員
				if( bFine == true )
				{
					logger.info('有找到 結束步驟 Account:' + Account );
					CallBackFunc(MESSAGE_CODE_REREGISTER, req, Status );// end
				}
				else
				{
					logger.info('沒找到 往下一個步驟去 Account=' + Account );
					CallBackFunc(null,req,Status);// next
				}		
			}
			break;
			
			case STATUS_DEL_MEMBER_DATA:// 刪除會員
			case STATUS_UPDATE_MEMBER_DATA:// 更新會員
			case STATUS_GET_MEMBER_DATA:	// 查詢單一會員
			case STATUS_LOGIN:				// 登入	
			{
				if( bFine == true )
				{
					logger.info('有找到 往下一個步驟去 Account=' + Account );
					CallBackFunc(null,req,Status);// next
				}
				else
				{
					logger.info('沒找到 結束步驟 Account:' + Account );
					CallBackFunc(MESSAGE_CODE_MEMBER_NO_FIND, req, Status );// end
				}					
			}
			break;
						
			default:
				logger.info('warning SQL_PlayerInfoAuth 跑到default 結束步驟 Status=' + Status + ' Account:' + Account );
				CallBackFunc(MESSAGE_CODE_UNKNOW, req, Status );// end
			break;
		}		

	});
}


//==============================================================================================
//執行 驗證玩家資料 (有帶資料到下一步去)
function SQL_PlayerInfoAuth2( req, Status, CallBackFunc )
{
	logger.info('===SQL_PlayerInfoAuth2 Status=' + Status );
	
	var UID = req.body['UID'];
	var Account = req.body['Account'];
	var PassWord = req.body['PassWord'];
	
	var SqlQuery = "";
	if( Status ==  STATUS_DEL_MEMBER_DATA || Status ==  STATUS_START_SPIN )
		SqlQuery = util.format("SELECT * FROM member where UID=%d AND Account='%s' AND PassWord='%s';", UID, Account, PassWord );
	else
		SqlQuery = util.format("SELECT * FROM member where Account='%s' AND PassWord='%s';", Account, PassWord );
	
	var bFine = false;

	logger.info('SqlQuery=' + SqlQuery );
		
	//接著就可以開始進行查詢
	connection.query(SqlQuery,function(error, rows){
		//檢查是否有錯誤
		if(error){
			
			logger.info('SQL_PlayerInfoAuth2 SqlQuery error:' + error );
			CallBackFunc(MESSAGE_CODE_ERROR_SQL, req, Status );// end
			//throw error;
			return;
		}
		//logger.info('mysql data:' + rows[0]); //2
		
		for (var i in rows) {
	
			var member = rows[i];
			if( member.Account == Account && member.PassWord == PassWord )
			{
				bFine = true;
				logger.info('有找到 i=' + i +  ' Account=' + Account + 'PassWord=' + member.PassWord + ' Game_Money=' +  member.Game_Money  );
			}	
		}
		
		switch( Status )	
		{
			case STATUS_REGISTER_MEMBER_DATA:	// 新增會員
			case STATUS_ADD_MEMBER_DATA:	// 新增會員
			{
				if( bFine == true )
				{
					logger.info('有找到 結束步驟 Account:' + Account );
					CallBackFunc(MESSAGE_CODE_REREGISTER, req, Status, rows );// end
				}
				else
				{
					logger.info('沒找到 往下一個步驟去 Account=' + Account );
					CallBackFunc(null,req,Status, rows );// next
				}		
			}
			break;
			
			case STATUS_DEL_MEMBER_DATA:		// 刪除會員
			case STATUS_UPDATE_MEMBER_DATA:		// 更新會員
			case STATUS_GET_MEMBER_DATA:		// 查詢單一會員
			case STATUS_ADD_CUSTOMER_DATA:		// 新增顧客
			case STATUS_LOGIN:					// 登入
			case STATUS_START_SPIN:				// 開始Spin
			{
				if( bFine == true )
				{
					logger.info('有找到 往下一個步驟去 Account=' + Account );
					CallBackFunc(null,req,Status, rows );// next
				}
				else
				{
					logger.info('沒找到 結束步驟 Account:' + Account );
					CallBackFunc(MESSAGE_CODE_MEMBER_NO_FIND, req, Status, rows );// end
				}					
			}
			break;
						
			default:
				logger.info('warning SQL_PlayerInfoAuth2 跑到default 結束步驟 Status=' + Status + ' Account:' + Account );
				CallBackFunc(MESSAGE_CODE_UNKNOW, req, Status, rows );// end
			break;
		}		

	});
}
//==============================================================================================
//執行 製造玩家 UID
function SQL_PlayerInfoUIDGet( req, Status, CallBackFunc )
{
	logger.info('===SQL_PlayerInfoUIDGet Status=' + Status );
	
	var SqlQuery = util.format('SELECT MAX(id) as id_Max FROM member');
	var Score = 0;
	var bFine = false;

	logger.info('SqlQuery=' + SqlQuery );
		
	//接著就可以開始進行查詢
	connection.query(SqlQuery,function(error, rows){
		//檢查是否有錯誤
		if(error){
			
			logger.info('SQL_PlayerInfoUIDGet SqlQuery error:' + error );
			CallBackFunc(MESSAGE_CODE_ERROR_SQL, req, Status );// end
			//throw error;
		}
		logger.info('SQL_PlayerInfoUIDGet mysql data:' + rows[0].id_Max); //2
		
		var NewUID = 0;
		if( rows[0].id_Max == null  )
		{
			logger.info("id_Max == null 所以重1開始");
			NewUID = 1;
		}
		else
		{
			NewUID = rows[0].id_Max;
			NewUID++;
			logger.info("id_Max != null 所以NewUID=" + NewUID );
		}
		
		switch( Status)	
		{
			case STATUS_ADD_MEMBER_DATA:
			case STATUS_REGISTER_MEMBER_DATA:
			{// 新增會員
				if( bFine == true )
				{
					logger.info('有找到 結束步驟 NewUID:' + NewUID );
					CallBackFunc(MESSAGE_CODE_REREGISTER, req, Status );// end
					//CallBackFunc('error999', req, Status );
				}
				else
				{
					logger.info('沒找到 往下一個步驟去 NewUID=' + NewUID );
					CallBackFunc(null,req,Status,NewUID);// next inster
				}		
			}
			break;
			
				
			default:
				logger.info('warning SQL_PlayerInfoUIDGet 跑到default 結束步驟 Status:' + Status );
				CallBackFunc(MESSAGE_CODE_UNKNOW, req, Status );// end
			break;
		}		

	});
} 

//==============================================================================================
//執行 新增玩家資料
function SQL_PlayerInfoInster( req, Status, NewUID, CallBackFunc )
{
	logger.info('===SQL_PlayerInfoInster Status=' + Status );
	logger.info('===SQL_PlayerInfoInster NewUID=' + NewUID );
	
	var UID 			= NewUID;
	var UUID 			= req.body['UUID'];
	var Name 			= req.body['Name'];
	var Account			= req.body['Account'];
	var PassWord		= req.body['PassWord'];
	var IdentityNumber 	= req.body['IdentityNumber'];
	var Address 		= req.body['Address'];
	var PhoneNumber 	= req.body['PhoneNumber'];
	var Salary 			= req.body['Salary'];
	var Bonus 			= req.body['Bonus'];
	var Game_Money 			= req.body['Game_Money'];		// 遊戲使用

	logger.info('===SQL_PlayerInfoInster UID=' + UID );
	logger.info('===SQL_PlayerInfoInster UUID=' + UUID );
	logger.info('===SQL_PlayerInfoInster Name=' + Name );
	logger.info('===SQL_PlayerInfoInster Account=' + Account );
	logger.info('===SQL_PlayerInfoInster PassWord=' + PassWord );
	
	logger.info('===SQL_PlayerInfoInster IdentityNumber=' + IdentityNumber );
	logger.info('===SQL_PlayerInfoInster Address=' + Address );
	logger.info('===SQL_PlayerInfoInster PhoneNumber=' + PhoneNumber );
	logger.info('===SQL_PlayerInfoInster Salary=' + Salary );
	logger.info('===SQL_PlayerInfoInster Bonus=' + Bonus );
	logger.info('===SQL_PlayerInfoInster Game_Money=' + Game_Money );
	
	var UIDTmp = util.format('%d', UID);
	//插入資料
	var data = {
		UID: UIDTmp,
		UUID:UUID,
		Platform:35,
		LoginState: 1,
		//LoginTime:'',
		CreateTime:new Date(),
		//UpdateTime:'',
		Name:Name,
		Account:Account,
		PassWord:PassWord,
		IdentityNumber:IdentityNumber,
		Address:Address,
		PhoneNumber:PhoneNumber,
		Salary: Salary,
		Bonus: Bonus,
		Game_Money
	};

	logger.info('SqlQuery data:' + JSON.stringify(data) );
	
	connection.query('INSERT INTO `member` SET ?', data, function(error){
		if(error){
			logger.info('SQL_PlayerInfoInster 寫入資料失敗！ error=' + error );
			CallBackFunc(MESSAGE_CODE_ERROR_SQL, req, Status );// end
		}
		else
		{
			logger.info('寫入資料成功！');
			CallBackFunc(MESSAGE_CODE_SUCCESS, req, Status);// end
		}
	});
}

//==============================================================================================
//執行 刪除玩家資料
function SQL_PlayerInfoDelete( req, Status, CallBackFunc )
{
	logger.info('===SQL_PlayerInfoDelete Status=' + Status );
	
	var UID			= req.body['UID'];
	var Account		= req.body['Account'];
	var PassWord	= req.body['PassWord'];
	var SqlQuery 	= util.format("Delete FROM member where UID=%d AND Account='%s' AND PassWord='%s';", UID, Account, PassWord );
	var Score = 0;
	var bFine = false;

	logger.info('SqlQuery=' + SqlQuery );
		
	//接著就可以開始進行查詢
	connection.query(SqlQuery,function(error, rows){
		//檢查是否有錯誤
		if(error){
			
			bFine = false
			logger.info('SQL_PlayerInfoDelete SqlQuery error:' + error );
			CallBackFunc(MESSAGE_CODE_ERROR_SQL, req, Status );// end
			//throw error;
		}
		else
		{
			bFine = true;
		}
		logger.info('SQL_PlayerInfoDelete mysql data:' + rows[0] + ' bFine=' + bFine); //2
		
		switch( Status)	
		{
			case STATUS_DEL_MEMBER_DATA:
			{// 刪除會員
				if( bFine == true )
				{
					logger.info('有找到 結束步驟 uid:' + UID );
					CallBackFunc(MESSAGE_CODE_SUCCESS, req, Status );// end
				}
				else
				{
					logger.info('沒找到 往下一個步驟去 UID=' + UID );
					CallBackFunc(MESSAGE_CODE_MEMBER_NO_FIND, req, Status );// end
					//CallBackFunc(null,req,Status);// next
				}		
			}
			break;
			
				
			default:
				CallBackFunc(MESSAGE_CODE_UNKNOW, req, Status );// end
			break;
		}		

	});
} 



//==============================================================================================
//修改會員狀態
function SQL_PlayerInfoUpdate( req, Status, CallBackFunc )
{
	var UID			= req.body['UID'];
	var Name		= req.body['Name'];
	var Account		= req.body['Account'];
	var PassWord	= req.body['PassWord'];

	var IdentityNumber 	= req.body['IdentityNumber'];
	var Address 		= req.body['Address'];
	var PhoneNumber 	= req.body['PhoneNumber'];
	var Salary 			= req.body['Salary'];
	var Bonus 			= req.body['Bonus'];	
	
	var SqlDataQuery = util.format("Name='%s', PassWord='%s', IdentityNumber='%s', Address='%s', PhoneNumber='%s', Salary=%d, Bonus=%d ", 
	Name, PassWord, IdentityNumber, Address, PhoneNumber, Salary, Bonus );
	
	logger.info('===SQL_PlayerInfoUpdate UID=' + UID + ' SqlDataQuery=' + SqlDataQuery  );
	
	var SqlQuery = util.format("update member set %s where UID=%d AND Account='%s' AND PassWord='%s';", SqlDataQuery, UID, Account, PassWord );
	var bFine = 0;

	logger.info('SqlQuery data:' + SqlQuery );
	
	//接著就可以開始進行查詢
	connection.query(SqlQuery,function(error, rows){
		//檢查是否有錯誤
		if(error){
			
			logger.info('SQL_PlayerInfoUpdate SqlQuery error 更新資料失敗:' + error );
			CallBackFunc(MESSAGE_CODE_ERROR_SQL, req, Status );// end
		}
		else
		{
			logger.info('SQL_PlayerInfoUpdate 資料成功 mysql return data:' + rows); //2
			CallBackFunc(MESSAGE_CODE_SUCCESS, req, Status);// end
		}
		
	});
		
}

//==============================================================================================
//修改登入狀態
function PlayerInfoUpdateScore( req, Status, rows, CallBackFunc )
{
	var Account		= req.body['Account'];
	var PassWord	= req.body['PassWord'];
	var LoginState = 1;
	logger.info('===PlayerInfoUpdateScore Account=' + Account );
	logger.info('===PlayerInfoUpdateScore PassWord=' + PassWord );
	
	// 備份查詢的資料
	var rowsTmp = rows;

		
	var SqlQuery = util.format('update member set LoginState=%d  where Account="%s" AND PassWord="%s" ;', LoginState, Account,PassWord);
	var bFine = 0;

	logger.info('SqlQuery data:' + SqlQuery );
	
	//接著就可以開始進行查詢
	connection.query(SqlQuery,function(error, rows ){
		//檢查是否有錯誤
		if(error){
			
			logger.info('PlayerInfoUpdateScore SqlQuery error 更新資料失敗:' + error );
			CallBackFunc(MESSAGE_CODE_ERROR_SQL, req, Status, rowsTmp );// end
		}
		else
		{
			logger.info('PlayerInfoUpdateScore 資料成功 mysql return data:' + rows); //2
			CallBackFunc(MESSAGE_CODE_SUCCESS, req, Status, rowsTmp);// end
		}
		
	});
		
}


//==============================================================================================
//執行 取得玩家資料 ( 特製的, 後面不要加其他東西 )
function SQL_PlayerInfoDataGet( req, Status, CallBackFunc )
{
	logger.info('===SQL_PlayerInfoDataGet Status=' + Status );
	
	var UID			= req.body['UID'];
	var Name		= req.body['Name'];
	var Account		= req.body['Account'];
	var PassWord	= req.body['PassWord'];
	var SqlQuery 	= util.format("SELECT * FROM member where Account='%s' AND PassWord='%s';", Name,Account,PassWord);
	
	var bFine = false;

	logger.info('SqlQuery=' + SqlQuery );
		
	//接著就可以開始進行查詢
	connection.query(SqlQuery,function(error, rows){
		//檢查是否有錯誤
		if(error){
			
			logger.info('SQL_PlayerInfoDataGet SqlQuery error:' + error );
			CallBackFunc(MESSAGE_CODE_ERROR_SQL, req, Status );// end
			//throw error;
		}
		logger.info('mysql data:' + rows[0]); //2
		
		for (var i in rows) {
	
			var member = rows[i];
			if( member.UID == UID )
			{
				bFine = true;
				logger.info('有找到 UID=' + UID + " Name=" + member.Name  );
			}	
		}
		
		if( typeof rows[0] !== 'undefined' && rows[0] )
		{
			var json_str = JSON.stringify(rows);
			logger.info('有找到 json_str=' + json_str  );
			bFine = true;
			CallBackFunc(MESSAGE_CODE_SUCCESS, req, Status, rows  );// end
		}
		else
		{
			bFine = false;
			CallBackFunc(MESSAGE_CODE_MEMBER_NO_FIND, req, Status, 0 );// end
		}
		

	});
}


//==============================================================================================
//執行 新增顧客資料
function SQL_CustomerInfoInster( req, Status, rows, CallBackFunc )
{
	logger.info('===SQL_CustomerInfoInster Status=' + Status );
	logger.info('===SQL_CustomerInfoInster rows=' + rows );
	
	var UID 			= 0;
	var Name 			= "";
	
	var CustomerName			= req.body['CustomerName'];					// 顧客姓名
	var CustomerAge				= req.body['CustomerAge'];					// 顧客年紀	
	var CustomerGender			= req.body['CustomerGender'];				// 顧客性別
	var CustomerIdentityNumber 	= req.body['CustomerIdentityNumber'];		// 顧客身分證字號
	var CustomerPhoneNumber 	= req.body['CustomerPhoneNumber'];			// 顧客電話
	
	var CustomerAddress 		= req.body['CustomerAddress'];				// 顧客物件地址
	var CustomerHomeAge 		= req.body['CustomerHomeAge'];				// 顧客屋齡
	var CustomerHomeFootage 	= req.body['CustomerHomeFootage'];			// 顧客物件坪數
	var CustomerHomePrice 		= req.body['CustomerHomePrice'];			// 顧客物件價格
	

	// 找出 UID 跟 Name
	for (var i in rows) {
		var member = rows[i];
		UID = member.UID;
		Name = member.Name;
	}

	logger.info('===SQL_CustomerInfoInster UID=' + UID );
	logger.info('===SQL_CustomerInfoInster Name=' + Name );
	
	logger.info('===SQL_CustomerInfoInster CustomerName=' + CustomerName );
	logger.info('===SQL_CustomerInfoInster CustomerAge=' + CustomerAge );
	logger.info('===SQL_CustomerInfoInster CustomerGender=' + CustomerGender );
	logger.info('===SQL_CustomerInfoInster CustomerIdentityNumber=' + CustomerIdentityNumber );
	logger.info('===SQL_CustomerInfoInster CustomerPhoneNumber=' + CustomerPhoneNumber );
	
	logger.info('===SQL_CustomerInfoInster CustomerAddress=' + CustomerAddress );
	logger.info('===SQL_CustomerInfoInster CustomerHomeAge=' + CustomerHomeAge );
	logger.info('===SQL_CustomerInfoInster CustomerHomeFootage=' + CustomerHomeFootage );
	logger.info('===SQL_CustomerInfoInster CustomerHomePrice=' + CustomerHomePrice );
	
	
	//var UIDTmp = util.format('%d', UID);
	//插入資料
	var data = {
		UID: UID,
		Name:Name,
		CreateTime:new Date(),
		UpdateTime:new Date(),
		CustomerName: CustomerName,
		CustomerAge:CustomerAge,
		CustomerGender:CustomerGender,
		CustomerIdentityNumber:CustomerIdentityNumber,
		CustomerPhoneNumber:CustomerPhoneNumber,
		CustomerAddress:CustomerAddress,
		CustomerHomeAge:CustomerHomeAge,
		CustomerHomeFootage:CustomerHomeFootage,
		CustomerHomePrice: CustomerHomePrice
	};

	logger.info('SqlQuery data:' + JSON.stringify(data) );
	
	connection.query('INSERT INTO `customer` SET ?', data, function(error){
		if(error){
			logger.info('SQL_CustomerInfoInster 寫入資料失敗！ error=' + error );
			CallBackFunc(MESSAGE_CODE_ERROR_SQL, req, Status, 0 );// end
		}
		else
		{
			logger.info('寫入資料成功！');
			CallBackFunc(MESSAGE_CODE_SUCCESS, req, Status, 0 );// end
		}
	});
}


//==============================================================================================
//執行手機 開始Spin  ( 待整理, 多個寒士去接 )
function SQL_StartSpinAndUpdateData( req, Status, rows, CallBackFunc )
{
	var UID			= req.body['UID'];
	var Account		= req.body['Account'];
	var PassWord	= req.body['PassWord'];
	//var Bet			= req.body['Bet'];				// 玩家押注金額
	var BetKindStr	= req.body['BetKindArray'];			// 玩家押注種類
	
	var Game_Money  = rows[0].Game_Money;
	var Result		= false;						// 此次結果
	var Win_Money	= 0;							// 此次贏分	
	var TotalBet	= 0;							// 總押注
	var Rate_Bet_Cell = 10;      					// 一注１０元
	var FreePlay 	= false;						// 在玩一次
	var RetStartSpin;	// 回傳結果
	
	logger.info('===SQL_StartSpinAndUpdateData UID=' + UID );
	logger.info('===SQL_StartSpinAndUpdateData Account=' + Account );
	logger.info('===SQL_StartSpinAndUpdateData PassWord=' + PassWord );
	logger.info('===SQL_StartSpinAndUpdateData BetKindStr=' + BetKindStr );
	logger.info('===SQL_StartSpinAndUpdateData Game_Money=' + Game_Money );
	
	// 備份查詢的資料
	var rowsTmp = rows;

	// 印出陣列的值
	var BetKind = JSON.parse(BetKindStr);
	logger.info("len=" + BetKind.length);	
	
	
	var RateTable = new Array();
	    RateTable[0] = 5;       // 蘋果
        RateTable[1] = 20;      // 西瓜
        RateTable[2] = 30;      // 星星
        RateTable[3] = 40;      // 七
        RateTable[4] = 100;     // BAR
        RateTable[5] = 20;      // 鈴鐺
        RateTable[6] = 15;      // 葡萄
        RateTable[7] = 10;      // 柚子
        RateTable[8] = 2;       // 櫻桃
		
	var AwardTable = new Array();
		AwardTable[0] = 7;       // 柚子
        AwardTable[1] = 5;      // 鈴鐺
        AwardTable[2] = 4;      // 50BAR
        AwardTable[3] = 4;      // 100BAR
        AwardTable[4] = 0;     // apple
        AwardTable[5] = 8;      // 櫻桃
        AwardTable[6] = 6;      // 葡萄
		
        AwardTable[7] = 1;      // 西瓜
        AwardTable[8] = 8;       // 櫻桃
		AwardTable[9] = 999;     // 在玩一次
		AwardTable[10] = 0;       // 蘋果
		AwardTable[11] = 8;       // 櫻桃
		
		AwardTable[12] = 7;       // 柚子
		AwardTable[13] = 5;       // 鈴鐺
		AwardTable[14] = 8;       // 櫻桃
		AwardTable[15] = 3;       // 7
		AwardTable[16] = 0;       // 蘋果
		AwardTable[17] = 8;       // 櫻桃
		AwardTable[18] = 6;       // 葡萄
		
		AwardTable[19] = 2;       // 星星
		AwardTable[20] = 8;       // 櫻桃
		AwardTable[21] = 999;       // 在玩一次
		AwardTable[22] = 0;       // 蘋果
		AwardTable[23] = 8;       // 櫻桃
		
		
	
	logger.info("RateTable len=" + RateTable.length);
	for (var i in RateTable) {
		//logger.info("RateTable[%d]=%d", i, RateTable[i]);
		
	}
	
	//1. 隨機 random
	var SpinResult = usefloor(0,23);
	//var SpinResult = 9;
	logger.info("###亂數=" +  SpinResult + " AwardTable=" + AwardTable[SpinResult]);
	
	// 判斷是否有中獎
	
	//2. 扣錢
	if( Game_Money > 0 )
	{
		
		
		// 押注表
		for (var i in BetKind) 
		{
			logger.info("BetKind[%d]=%d", i, BetKind[i]);
			
			if( AwardTable[SpinResult] == 999)
			{//在玩一次
				logger.info("在玩一次　SpinResult=" + SpinResult);
				FreePlay = true;
			}
			
			if( BetKind[i] > 0 )
			{// 有押注
				logger.info("有押注 該注為=" + BetKind[i] );
				
				// 計算總押注
				TotalBet += BetKind[i]*Rate_Bet_Cell;	// 一注１０
				
				if(i == AwardTable[SpinResult])
				{// 有中獎
			
					if(AwardTable[SpinResult] == 4)
					{//BAR
						if( SpinResult == 2 )
						{
							Win_Money += BetKind[i]*50;
							logger.info("中了　50 BAR=" + BetKind[i]*50);
						}							
						else			
						{
							Win_Money += BetKind[i]*100;
							logger.info("中了 100 BAR=" + BetKind[i]*100);
						}
					}
					else
					{// 一般獎
						Win_Money += BetKind[i]*Rate_Bet_Cell;	// 一注１０
					}
				}
			}
		}
		
		logger.info("###總押注 TotalBet=" + TotalBet);
		logger.info("###總贏分Win_Money=" + Win_Money　+ " Before_Game_Money=" + Game_Money );
		if( FreePlay == true )
		{
			logger.info("###在玩一次　不扣錢");
		}
		else
		{
			logger.info("###一般計算");
			Game_Money += Win_Money - TotalBet;  // 目前身上金額 = 目前身上金額 + 贏分－押注
		}
		logger.info("###計算之後的金額 After_Game_Money=" + Game_Money + " 此次輸贏了=" + (Win_Money - TotalBet) );
	}
	else
	{
		logger.info('餘額不足喔: Game_Money=' + Game_Money  );
	}
	//3. 更新資料庫
	
	//4. 回傳給Client結果
		
	var SqlQuery = util.format('update member set Game_Money=%d  where UID=%d AND Account="%s" AND PassWord="%s" ;', Game_Money, UID,Account,PassWord);
	var bFine = 0;

	logger.info('SqlQuery data:' + SqlQuery );
	
	//接著就可以開始進行查詢
	connection.query(SqlQuery,function(error, rows ){
		//檢查是否有錯誤
		if(error){
			
			logger.info('SQL_StartSpinAndUpdateData SqlQuery error 更新資料失敗:' + error );
			
			
			RetStartSpin = new DTO_ResponseStartSpin(MESSAGE_CODE_ERROR_SQL, "message", UID, Account, "", Game_Money, 0, SpinResult, TotalBet, Win_Money );
			CallBackFunc(MESSAGE_CODE_ERROR_SQL, req, Status, rowsTmp, RetStartSpin );// end
		}
		else
		{
			logger.info('SQL_StartSpinAndUpdateData 資料成功 mysql return data:' + rows); //2
			RetStartSpin = new DTO_ResponseStartSpin(MESSAGE_CODE_SUCCESS, "message", UID, Account, "", Game_Money, 1, SpinResult, TotalBet, Win_Money );
			CallBackFunc(MESSAGE_CODE_SUCCESS, req, Status, rowsTmp, RetStartSpin );// end
		}
		
	});
}


//==============================================================================================
//執行 新增 GameLog
function SQL_GameLogInster( req, Status, rows, getData2, CallBackFunc )
{
	logger.info('===SQL_GameLogInster Status=' + Status );
	logger.info('===SQL_GameLogInster rows=' + rows );
	
	var Platform				= 1;//rows[0].Platform;					// 平台
	var UID 					= rows[0].UID;
	var Name 					= rows[0].Name;
	
	
	var Account					= rows[0].Account;					// 顧客帳號
	var TotalBet				= getData2.TotalBet;					// 顧客總壓注
	var Bet						= getData2.TotalBet;					// 顧客該次壓注
	var Before_Game_Money		= rows[0].Game_Money;				// 顧客之前的錢
	var After_Game_Money		= getData2.Game_Money;				// 顧客spin後的錢
	var Win_Money				= getData2.Win_Money;				// 顧客spin後 該次贏的錢
	var SpinResult				= getData2.SpinResult;				// 顧客spin的數值
	
	logger.info('===SQL_GameLogInster Platform=' + Platform );
	logger.info('===SQL_GameLogInster UID=' + UID );
	logger.info('===SQL_GameLogInster Name=' + Name );
	
	logger.info('===SQL_GameLogInster Account=' + Account );
	logger.info('===SQL_GameLogInster TotalBet=' + TotalBet );
	logger.info('===SQL_GameLogInster Bet=' + Bet );
	logger.info('===SQL_GameLogInster Before_Game_Money=' + Before_Game_Money );
	logger.info('===SQL_GameLogInster After_Game_Money=' + After_Game_Money );
	logger.info('===SQL_GameLogInster Win_Money=' + Win_Money );
	logger.info('===SQL_GameLogInster SpinResult=' + SpinResult );
	
	// 備份查詢的資料
	var rowsTmp = rows;
	
	//插入資料
	var data = {
		Platform:Platform,
		CreateTime:new Date(),
		UID: UID,
		Name:Name,
		Account: Account,
		TotalBet:TotalBet,
		Bet:Bet,
		Before_Game_Money:Before_Game_Money,
		After_Game_Money:After_Game_Money,
		Win_Money,
		SpinResult
	};

	logger.info('SqlQuery data:' + JSON.stringify(data) );
	
	connection.query('INSERT INTO `GameLog` SET ?', data, function(error){
		if(error){
			logger.info('SQL_GameLogInster 寫入資料失敗！ error=' + error );
			CallBackFunc(MESSAGE_CODE_ERROR_SQL, req, Status, rowsTmp, getData2 );// end
		}
		else
		{
			logger.info('SQL_GameLogInster 寫入資料成功！');
			CallBackFunc(MESSAGE_CODE_SUCCESS, req, Status, rowsTmp, getData2 );// end
		}
	});
}
//==============================================================================================
//執行 分析結果
function AnalysisResult( err, req, Status, getData, getData2 )
{
	var UID 	= req.body['UID'];
	var Account = req.body['Account'];
	var Result;
	logger.info('===AnalysisResult UID=' + UID + ' Account=' + Account + ' err=' + err );
	
	switch(err)
	{
		case MESSAGE_CODE_SUCCESS:
		{
			switch(Status)
			{
				case STATUS_ADD_MEMBER_DATA:
					message = '成功完成新增員工資料';
					Result = new DTO_Response(err,message,UID,Account, getData );
					break;
				case STATUS_UPDATE_MEMBER_DATA:
					message = '成功更新員工資料';
					Result = new DTO_Response(err,message,UID,Account, getData );
					break;					
				case STATUS_DEL_MEMBER_DATA:
					message = '成功完成刪除員工資料';
					Result = new DTO_Response(err,message,UID,Account, getData );
					break;

				case STATUS_GET_MEMBER_DATA:
					message = '成功完成取得員工資料';
					Result = new DTO_Response(err,message,UID,Account, getData );
					break;
					
				case STATUS_REGISTER_MEMBER_DATA:
					message = '成功完成註冊步驟';
					Result = new DTO_Response(err,message,UID,Account, getData );
					break;
				case STATUS_LOGIN:
					message = '成功完成登入步驟';
					Result = new DTO_Response2(err,message,getData[0].UID,Account, getData, getData[0].Game_Money );
					break;
				case STATUS_LOGOUT:
					message = '成功完成登出步驟';
					Result = new DTO_Response(err,message,UID,Account, getData );
					break;
					
				case STATUS_ADD_CUSTOMER_DATA:
					message = '成功完成新增顧客';
					Result = new DTO_Response(err,message,UID,Account, getData );
					break;
					
				case STATUS_START_SPIN:
					message = '成功完成StartSpin';
					getData2.Message = message;
					Result = getData2;	
					break;				
					
				default:
					message = '未知的成功完成步驟Status=' + Status;
					Result = new DTO_Response(err,message,UID,Account, getData );
					break;					
			}
			
		}
			break;
		case MESSAGE_CODE_ERROR:
			message = '失敗步驟';
			Result = new DTO_Response(err,message,UID,Account, getData );
			break;	
		case MESSAGE_CODE_REREGISTER:
			message = '重複註冊';
			Result = new DTO_Response(err,message,UID,Account, getData );
			break;		
		case MESSAGE_CODE_ERROR_SQL:
			message = 'SQL錯誤';
			Result = new DTO_Response(err,message,UID,Account, getData );
			break;		
		case MESSAGE_CODE_MEMBER_NO_FIND:
			message = '找不到會員';
			Result = new DTO_Response(err,message,UID,Account, getData );
			break;		
		case MESSAGE_CODE_MEMBER_IS_FIND:
			message = '找到會員';
			Result = new DTO_Response(err,message,UID,Account, getData );
			break;		
		case MESSAGE_CODE_ERROR:
			message = '失敗步驟';
			Result = new DTO_Response(err,message,UID,Account, getData );
			break;									
		default:
		message = '未知的錯誤 err=' + err ;
		Result = new DTO_Response(err,message,UID,Account, getData );
		break;
	}		

	logger.info('Result=' + Result );	
	return Result;
}




//==============================================================================================
// export area 
exports.SQL_PlayerInfoGet = SQL_PlayerInfoGet;
exports.SQL_PlayerInfoAuth = SQL_PlayerInfoAuth;
exports.SQL_PlayerInfoAuth2 = SQL_PlayerInfoAuth2;

exports.SQL_PlayerInfoUIDGet = SQL_PlayerInfoUIDGet;
exports.SQL_PlayerInfoInster = SQL_PlayerInfoInster;
exports.SQL_PlayerInfoDelete = SQL_PlayerInfoDelete;
exports.SQL_PlayerInfoUpdate = SQL_PlayerInfoUpdate;
exports.PlayerInfoUpdateScore = PlayerInfoUpdateScore;
exports.SQL_PlayerInfoDataGet = SQL_PlayerInfoDataGet;

exports.SQL_CustomerInfoInster = SQL_CustomerInfoInster;
exports.SQL_StartSpinAndUpdateData = SQL_StartSpinAndUpdateData;
exports.SQL_GameLogInster = SQL_GameLogInster;

exports.AnalysisResult = AnalysisResult;

// 錯誤代碼
exports.MESSAGE_CODE_SUCCESS = MESSAGE_CODE_SUCCESS
exports.MESSAGE_CODE_ERROR = MESSAGE_CODE_ERROR;
exports.MESSAGE_CODE_UNKNOW = MESSAGE_CODE_UNKNOW;
exports.MESSAGE_CODE_REREGISTER = MESSAGE_CODE_REREGISTER; 
exports.MESSAGE_CODE_ERROR_SQL = MESSAGE_CODE_ERROR_SQL; 
exports.MESSAGE_CODE_MEMBER_NO_FIND = MESSAGE_CODE_MEMBER_NO_FIND; 	// 找不到會員
exports.MESSAGE_CODE_MEMBER_IS_FIND = MESSAGE_CODE_MEMBER_IS_FIND; 	// 找到會員


// 流程狀態
exports.STATUS_ADD_MEMBER_DATA = STATUS_ADD_MEMBER_DATA;  
exports.STATUS_UPDATE_MEMBER_DATA = STATUS_UPDATE_MEMBER_DATA;  
exports.STATUS_GET_MEMBER_DATA = STATUS_GET_MEMBER_DATA;  
exports.STATUS_DEL_MEMBER_DATA = STATUS_DEL_MEMBER_DATA;  

exports.STATUS_REGISTER_MEMBER_DATA = STATUS_REGISTER_MEMBER_DATA;  
exports.STATUS_LOGIN = STATUS_LOGIN;  
exports.STATUS_LOGOUT = STATUS_LOGOUT;  

exports.STATUS_ADD_CUSTOMER_DATA = STATUS_ADD_CUSTOMER_DATA;  
exports.STATUS_START_SPIN = STATUS_START_SPIN;  
