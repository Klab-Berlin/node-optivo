var O = function() {
	var methods = [
		'subscribe',
		'unsubscribe',
		'updatefields',
		'copy',
		'move',
		'blacklist',
		'unblacklist',
		'sendeventmail',
		'sendtransactionmail',
		'getsendstatus',
		'nop',
		'onlineversion',
		'remove',
		'uploadpersonalizedattachments',
		'_request'
	];

	for( var index in methods ) {
		this[methods[index]] = function() {
			if(
				arguments.length &&
				typeof arguments[arguments.length-1] == 'function'
			)
				arguments[arguments.length-1](null, true);
		}
	}
};

module.exports = O;