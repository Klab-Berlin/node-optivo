var https = require("https");

var Optivo = function(data){
	var data = data || {};

	// Debugging mode disables sending of emails
	this.debug = data.debug || false;

	if (typeof data.defaultAuthCode !== 'undefined') {
		this.defaultAuthCode = data.defaultAuthCode;
	}
	
	console.log("Started optivo [debug=%s]", this.debug);
	return this;
}

/*
 *	needed: bmRecipientId
 */
Optivo.prototype.subscribe = function(data, callback){
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
	
	this._request(sendData, handleResponse);
}

/*
 *	needed: bmRecipientId
 */
Optivo.prototype.unsubscribe = function(data, callback){
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
	
	this._request(sendData, handleResponse);
}

Optivo.prototype.updatefields = function(data, callback){
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
	
	this._request(sendData, handleResponse);
}

Optivo.prototype.copy = function(data, callback){
//todo
}
Optivo.prototype.move = function(data, callback){
//todo
}
Optivo.prototype.blacklist = function(data, callback){
//todo
}
Optivo.prototype.unblacklist = function(data, callback){
//todo
}
Optivo.prototype.sendeventmail = function(data, callback){
//todo
}

/*
 *	needed: bmRecipientId
 *	needed: bmMailingId
 *	optional: bmPersonalizedAttachmentsToken - for attachments
 *	optional: every Parameter in the list
 */
Optivo.prototype.sendtransactionmail = function(data, callback){
	
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
	
	this._request(sendData, handleResponse);
}

Optivo.prototype.getsendstatus = function(data, callback){
//todo
}
Optivo.prototype.nop = function(data, callback){
//todo
}
Optivo.prototype.onlineversion = function(data, callback){
//todo
}

Optivo.prototype.remove = function(data, callback){
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
	
	this._request(sendData, handleResponse);
}

Optivo.prototype.uploadpersonalizedattachments = function(data, callback){

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

Optivo.prototype._request = function(data, callback){
	if( this.debug ) {
		console.log("Sending Mail - ", data);
		return callback(null, "ok HTTP - 200");
	} else {
		console.log("Sending Mail", data);
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
		callback('Optivo server Connection Problem' + e);
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

module.exports = Optivo;
