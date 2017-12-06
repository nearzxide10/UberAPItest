var express = require('express');
var router = express.Router();
var Uber = require('node-uber');
var request = require('request');
var uber = new Uber({
  client_id: 'PTERFXSNaLLgdB-anD2z4DcoYJ0CMH-G',
  client_secret: '-oP3N4Zk29BFcgKeMDseV8n4E5VAJOxxC5dzXl6q',
  server_token: 'y7h1gknRHxvppdkCyrHQETXHOtI1eSD21g1RW1dT',
  redirect_uri: 'https://ginago-taxi.azurewebsites.net/users/api_callback',
  name: 'APITEST',
  language: 'zh-tw', // optional, defaults to en_US
  sandbox: true, // optional, defaults to false
  //proxy: 'PROXY URL' // optional, defaults to none
});
var Access_token='';

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
  
});

//產生Oauth認證的URL
router.post('/geturl',function(req,res){
	var authURL = uber.getAuthorizeUrl(['history', 'profile', 'request', 'places']);
	res.send(authURL);
});

//產生Oauth認證的網頁for user
router.get('/api/login', function(request, response) {
	  var url = uber.getAuthorizeUrl(['history','profile', 'request', 'places']);
	  console.log(response.code);
	  response.redirect(url);
});

//Oauth回傳接口
router.get('/api_callback',function(req,res){
  console.log('api_callback in');
 uber.authorizationAsync({authorization_code: req.query.code})
    .spread(function(access_token, refresh_token, authorizedScopes, tokenExpiration) {
      // store the user id and associated access_token, refresh_token, scopes and token expiration date
      Access_token=access_token;
      console.log('New access_token retrieved: ' + access_token);
      console.log('... token allows access to scopes: ' + authorizedScopes);
      console.log('... token is valid until: ' + tokenExpiration);
      console.log('... after token expiration, re-authorize using refresh_token: ' + refresh_token);
 
      // redirect the user back to your actual app
      res.redirect('/test.html');
    })
    .error(function(err) {
      console.error(err);
    });
});

//取得地點資訊 看起來是取得地點車種
router.post('/product_test',function(req,res){
	uber.products.getAllForAddressAsync('台北市大同區承德路一段1號')
	.then(function(ret) { 
		console.log(ret); 
		res.json(ret);
		})
	.error(function(err) { 
		console.error(err); 
		});
	
});

//創建訂單
router.post('/createrequest',function(req,res){
		uber.requests.createAsync({
		  "fare_id": "d30e732b8bba22c9cdc10513ee86380087cb4a6f89e37ad21ba2a39f3a1ba960",
		  "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
		  "start_latitude": 37.761492,
		  "start_longitude": -122.423941,
		  "end_latitude": 37.775393,
		  "end_longitude": -122.417546
		})
	.then(function(ret) { 
		console.log(ret);
			res.json(ret);
	})
	.error(function(err) { console.error(err); });
	
});


//估算車資(使用地址)
router.get('/uberprice',function(req,res){
	var formaddress =req.param('formaddress');
	var toaddress=req.param('toaddress');
	var data = {
        
        update_time: (new Date()).getTime()
    };  
	uber.estimates.getPriceForRouteByAddressAsync(formaddress,toaddress)
  .then(function(resprice) {
	  console.log(resprice); 
	  data.localized_display_name=resprice.prices[0].localized_display_name;
	  data.estimate=resprice.prices[0].estimate;
	  
	  res.json(data);
	  
	  
	  })
  .error(function(err) { 
	  console.error(err);
	  res.json(err);
	  
	  });
	
});

//預估車輛到達時間秒
router.get('/ETA',function(req,res){
	uber.estimates.getETAForAddressAsync("台北市大同區承德路一段1號")
	.then(function(ret) { 
		console.log(ret); 
		res.json(ret);
		})
	.error(function(err) { 
		console.error(err);
		});
	
	/* 寫法二
	uber.estimates.getETAForAddressAsync("台北市大同區承德路一段1號",function(err,ret){
		if(err) console.log(ret);
		else res.json(ret);
	});	
	*/
});

//取得uber用戶資訊	
router.post('/userProfile',function(req,res){
	uber.user.getProfileAsync()
	.then(function(ret) {
		console.log(ret);
		res.json(ret);
		})
	.error(function(err) {
		console.error(err);
		res.json(err);		
		});
});	

//重新註冊token (時長一個月)
router.post('/refreshlogin',function(req,res){
	uber.authorizationAsync({ refresh_token: 'MA.CAESEKDH4-ISAkjxkkzQxu36NhEiATEoATIBMQ.yyKPw7BMJEWeslLj7uCjGA_xAI58AmyX5A-IWTJxVbY.2mxzJ_w78nZZN_2fjZiPab7ZJalw5yHCYNYpJGX4QGM' })
	.then(function(access_token) {
		console.log(access_token);
		res.json(access_token);
		})
	.error(function(err) {
		console.error(err);
		});
	
});

//computer vision 圖像分析API
router.post('/vision',function(req,res){
	var imgurl ={"url":req.body.url};
 	request({
    headers: {
     'Content-Type': 'application/json',
     'Ocp-Apim-Subscription-Key':'71dc54db31384dd5878472ac9cf68112'
    },
    uri: 'https://eastasia.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Categories,Description,Color&language=en',
    json: imgurl,
    method: 'POST'
  }, function (err, ret, body) {
    //it works!
    res.json(body);
  });

 });

//未完成
router.post('/Textvision',function(req,res){
	var imgurl ={"url":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Cursive_Writing_on_Notebook_paper.jpg/800px-Cursive_Writing_on_Notebook_paper.jpg"};
 	request({
    headers: {
     'Content-Type': 'application/json',
     'Ocp-Apim-Subscription-Key':'71dc54db31384dd5878472ac9cf68112'
    },
    timeout: 10000
    ,
    uri: 'https://eastasia.api.cognitive.microsoft.com/vision/v1.0/recognizeText?handwriting=true',
    json: imgurl,
    method: 'POST'
  }, function (err, ret, body) {
    //it works!
    console.log(ret);
    res.json(ret);
  });

 });


/*
router.delete('/removetoken',function(req,res){
	res.json("OK");
});
*/


module.exports = router;
