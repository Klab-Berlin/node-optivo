var https = require("https");

var optivo = function(data){
	// Debugging mode disables sending of emails
	this.debug = data.debug || false;

	var data = data || {};
	if (typeof data.defaultAuthCode !== 'undefined') {
		this.defaultAuthCode = data.defaultAuthCode;
	}
	
	return this;
}

/*
 *	needed: bmRecipientId
 */
optivo.prototype.subscribe = function(data, callback){
	var sendData = {
		authCode : data.authCode,
		command : 'subscribe',
		parameter : data
	}
	
	function handleResponse (err, data) {
		if (err)  return callback(err);
		if (data.search(/^ok/) !== 0) return callback(data);
		callback(null,data);
	}
	
	request(sendData, handleResponse);
}

/*
 *	needed: bmRecipientId
 */
optivo.prototype.unsubscribe = function(data, callback){
	var sendData = {
		authCode : data.authCode,
		command : 'unsubscribe',
		parameter : data
	}
	
	function handleResponse (err, data) {
		if (err)  return callback(err);
		if (data.search(/^ok/) !== 0) return callback(data);
		callback(null,data);
	}
	
	request(sendData, handleResponse);
}

optivo.prototype.updatefields = function(data, callback){
	var sendData = {
		authCode : data.authCode,
		command : 'updatefields',
		parameter : data
	}
	
	function handleResponse (err, data) {
		if (err)  return callback(err);
		if (data.search(/^ok/) !== 0) return callback(data);
		callback(null,data);
	}
	
	request(sendData, handleResponse);
}

optivo.prototype.copy = function(data, callback){
//todo
}
optivo.prototype.move = function(data, callback){
//todo
}
optivo.prototype.blacklist = function(data, callback){
//todo
}
optivo.prototype.unblacklist = function(data, callback){
//todo
}
optivo.prototype.sendeventmail = function(data, callback){
//todo
}

/*
 *	needed: bmRecipientId
 *	needed: bmMailingId
 *	optional: bmPersonalizedAttachmentsToken - for attachments
 *	optional: every Parameter in the list
 */
optivo.prototype.sendtransactionmail = function(data, callback){
	
	var sendData = {
		authCode : data.authCode || this.defaultAuthCode,
		command : 'sendtransactionmail',
		parameter : data
	}
	
	function handleResponse (err, data) {
		if (err)  return callback(err);
		if (data.search(/^enqueued:\ /) !== 0) return callback(data);
		callback(null,{enqueued : data.replace(/enqueued:\ /, "")});
	}
	
	request(sendData, handleResponse);
}

optivo.prototype.getsendstatus = function(data, callback){
//todo
}
optivo.prototype.nop = function(data, callback){
//todo
}
optivo.prototype.onlineversion = function(data, callback){
//todo
}

optivo.prototype.remove = function(data, callback){
	var sendData = {
		authCode : data.authCode,
		command : 'remove',
		parameter : data
	}
	
	function handleResponse (err, data) {
		if (err)  return callback(err);
		if (data.search(/^ok/) !== 0) return callback(data);
		callback(null,data);
	}
	
	request(sendData, handleResponse);
}

optivo.prototype.uploadpersonalizedattachments = function(data, callback){

	if (typeof data.files !== 'object') {
		return callback('missing paramter: files. Nothing to upload',null);
	}
	var boundary = "" + (new Date().getTime()) + Math.round(Math.random() * 1000);
	var reqData = {
		headers : {
			"content-length": 0,
			'Content-Type'	: 'multipart/form-data; boundary='+boundary
		},
		authCode : data.authCode || this.defaultAuthCode,
		command : 'uploadpersonalizedattachments',
		postData : []
	}
	
	function handleError(err, response){
		if (response.search(/^ok: /) !== 0){
			return callback(response, null);
		}
		callback(null, response.substring(4));
	}
	
	for (var i in data.files) {

		reqData.postData = reqData.postData.concat([
			'--' + boundary + '\r\n',
			'Content-Disposition: form-data; name="bmFile"; filename="' + data.files[i].filename+'"\r\n',
			"Content-Type: application/pdf\r\n",
			"Content-Transfer-Encoding: binary\r\n",
			"\r\n",
			data.files[i].data,
			"\r\n--" + boundary + "--\r\n"
		]);
	}
	
	for (var i in reqData.postData){
		reqData.headers["content-length"] += reqData.postData[i].length;
	}
	
	request(reqData, handleError);
}

module.exports = optivo;

function request(data, callback){
	if( this.debug ) {
		console.log("Sending Mail - ", data);
		return callback(null, {});
	}

	var req,
		responseData=[],
		parameterArray = ["bmEncoding=utf-8"],
		pathArray = ['','http', 'form', data.authCode, data.command],
		options = {
		host: 'api.broadmail.de',
		method: (typeof data.postData !== 'undefined') ? 'POST' : 'GET'
	};
	
	function requestCallback(res) {
		res.setEncoding('utf8');
		res.on('data', requestResponseData);
		res.on('end',requestResponseEnd);
	}
	
	function handleRequestError (e) {
		callback('Optivoserver Connection Problem' + e);
	}
	
	function requestResponseData(chunk) {
		responseData.push(chunk);
	}
	
	function requestResponseEnd(chunk) {
		responseData = responseData.join("");
		callback(null, responseData);
	}
	
	if (typeof data.headers !== 'undefined') {
		options.headers = data.headers;
	}
	
	
	for (var key in data.parameter) {
		if (key === 'authCode') continue;
		parameterArray.push([encodeURI(key), encodeURI(data.parameter[key])].join("="));
	}
	
	options.path = pathArray.join("/") + "?" + parameterArray.join("&");
	req = https.request(options, requestCallback);
	req.on('error',handleRequestError);
	
	if(options.method === 'POST') {
		if (data.postData instanceof Array) {
			for (var i in data.postData) {
				req.write(data.postData[i]);
			}
		}
		else if (typeof data.postData === 'object') {
			req.write(JSON.stringify(data.postData));
		}
		else {
			req.write(data.postData);
		}
	}
	req.end();
}
