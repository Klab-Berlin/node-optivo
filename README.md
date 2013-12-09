#optivo

###description

API-Call Wrapper for Optivo E-Mail-Marketing

#optivo

###description

API-Call Wrapper for Optivo E-Mail-Marketing

##init

```javascript

  var optivoModule = require('optivo');
  var optivo = new optivoModule();

```

### options

```javascript

  var options = {
    defaultAuthCode : [STRING]
  }
  var optivo = new optivoModule(options)

```

- defaultAuthCode: Here you can set a default Authorization Code for Triggerlists. So you can use the sendtransactionmail function without a authCode.


##subscribe

To subscribe a user on a optivo-list. _parameter_ can have every column of the optivolist as a attribute.

```javascript

  var parameter = {
    authCode : [STRING],
    bmRecipientId : [EMAIL]
  }
  optivo.subscribe(parameter, function(err, data){
    console.log(data);
  });

```

##unsubscribe

To unsubscribe a user of a optivo-list.

```javascript

  var parameter = {
    authCode : [STRING],
    bmRecipientId : [EMAIL]
  }
  optivo.unsubscribe(parameter, function(err, data){
    console.log(data);
  });

```

##updatefields

Update fields for a user in a optivo-list. _parameter_ need values for columns which given as attributes.

```javascript

  var parameter = {
    authCode : [STRING],
    bmRecipientId : [EMAIL]
  }
  optivo.updatefields(parameter, function(err, data){
    console.log(data);
  });

```

##sendtransactionmail

_parameter_ can also have values from the columns of the otivo-lists.

```javascript

  var parameter = {
    authCode : [STRING],                      //optional if a defaultAuthCode is given
    bmRecipientId : [EMAIL],
    bmPersonalizedAttachmentsToken : [STRING] //optinal, if you want sent a Mail with Attachment
  }
  optivo.sendtransactionmail(parameter, function(err, data){
    console.log(data);
  });

```

##remove

Remove a Email from the List.

```javascript
  var parameter = {
    authCode : [STRING],
    bmRecipientId : [EMAIL]
  }
  optivo.remove(parameter, function(err, data){
    console.log(data);
  });

```

##uploadpersonalizedattachments

At the moment, only with PDF Content-Type. _parameter_ is taken a Array with one or more Objects, wich have a buffer to upload it to optivo. It returns a bmPersonalizedAttachmentsToken.
(tested with only one file)

```javascript

  var parameter = {
    files : [
      {
        filename : [STRING],
        data : [BUFFER]
      }
    ]
  }
  
  optivo.uploadpersonalizedattachments(parameter, function(err, data){
    console.log('bmPersonalizedAttachmentsToken:', data)
  });
  
```




