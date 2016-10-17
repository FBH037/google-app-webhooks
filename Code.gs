
// Special Apps Script function to process HTTP POST request
function doPost(e){
  return handleResponse(e);
}

function doGet(e){
   return HtmlService.createTemplateFromFile('index').evaluate();
}

function updateFilter(e) {
  if( PropertiesService.getScriptProperties().getProperties()[e] ){
    PropertiesService.getScriptProperties().deleteProperty(e)
  } else {
    PropertiesService.getScriptProperties().setProperty(e, e)
  }
}


function handleResponse(e) {
  // Parse JSON webhook payload
  var jsonString = e.postData.getDataAsString();


  if (!(JSON.stringify(jsonString).indexOf("mailgun") > -1) ){
    var payload = JSON.parse(jsonString);

    var sendgridFiles = DriveApp.getFilesByName('Sendgrid webhook')
    var sendgridFile;

    if ( sendgridFiles.hasNext()  ) {
      sendgridFile = SpreadsheetApp.open(sendgridFiles.next())
    } else {
      sendgridFile = SpreadsheetApp.create('Sendgrid webhook');
      sendgridFile.appendRow(["Email", "Timestamp", "SMTP ID", "Event", "Category", "Sg Event ID", "Sg Message ID"]);
    }


    for(i = 0; i < payload.length; i++){
      sendgridEvent = payload[i]

      sendgridFile.appendRow([sendgridEvent["email"], sendgridEvent["timestamp"], sendgridEvent["smtp-id"], sendgridEvent["event"], sendgridEvent["category"], sendgridEvent["sg_event_id"], sendgridEvent["sg_message_id"]] )
      if(!PropertiesService.getScriptProperties().getProperties()[sendgridEvent["event"]] ){
        sendSendgridMail(sendgridEvent);
      }

    }
  } else {
    var mailgunFiles = DriveApp.getFilesByName('Mailgun webhook')
    var mailgunFile;

    if ( mailgunFiles.hasNext()  ) {
      mailgunFile = SpreadsheetApp.open(mailgunFiles.next())
    } else {
      mailgunFile = SpreadsheetApp.create('Mailgun webhook');
      mailgunFile.appendRow(["Event", "Recipient", "Domain", "Message Headers", "Message Id", "My Var 1", "My Var 2", "Timestamp", "Token", "Signature"]);
    }
     jsonString = "?" + jsonString

    mailgunFile.appendRow([ getParameterByName("event", jsonString),
      getParameterByName("recipient", jsonString),
      getParameterByName("domain", jsonString),
      getParameterByName("message-headers", jsonString),
      getParameterByName("Message-Id", jsonString),
      getParameterByName("my_var_1", jsonString),
      getParameterByName("my-var-2", jsonString),
      getParameterByName("timestamp", jsonString),
      getParameterByName("token", jsonString),
      getParameterByName("signature", jsonString)] );
    if(!PropertiesService.getScriptProperties().getProperties()[getParameterByName("event", jsonString)] ){
      sendMailgunMail(jsonString);
    }
  }
}
  function getParameterByName(name, url) {
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
  function sendMailgunMail(jsonString) {
    // Build email body
    var body = "<p>" +
        "<b>Event: </b>" + getParameterByName("event", jsonString) + "<br>" +
        "<b>Recipient: </b>" + getParameterByName("recipient", jsonString) + "<br>" +
        "<b>Domain: </b>" + getParameterByName("domain", jsonString) + "<br>" +
        "<b>Message Headers: </b>" + getParameterByName("message-headers", jsonString) + "<br>" +
        "<b>Message Id: </b>" + getParameterByName("Message-Id", jsonString) + "<br>" +
        "<b>Variable 1: </b>" + getParameterByName("my_var_1", jsonString) + "<br>" +
        "<b>Variable 2: </b>" + getParameterByName("my-var-2", jsonString) + "<br>" +
        "<b>Timestamp: </b>" + getParameterByName("timestamp", jsonString) + "<br>" +
        "<b>Token: </b>" + getParameterByName("token", jsonString) + "<br>" +
        "<b>Signature: </b>" + getParameterByName("signature", jsonString) + "<br>" +
      "</p>";

    // Send email
    MailApp.sendEmail({
      to: "fbhewitt@gmail.com",
      subject: getParameterByName("event", jsonString) + ":" + getParameterByName("domain", jsonString),
      htmlBody: body
    });
  }

  function sendSendgridMail(sendgridEvent) {
    // Build email body
    var body = "<p>" +
                  "<b>Email: </b>" + sendgridEvent["email"] + "<br>" +
                  "<b>Timestamp: </b>" + sendgridEvent["timestamp"] + "<br>" +
                  "<b>SMTP ID: </b>" + sendgridEvent["smtp-id"] + "<br>" +
                  "<b>Event: </b>" + sendgridEvent["event"] + "<br>" +
                  "<b>Category: </b>" + sendgridEvent["category"] + "<br>" +
                  "<b>Sg Event ID: </b>" + sendgridEvent["sg_event_id"] + "<br>" +
                  "<b>Sg Message ID: </b>" + sendgridEvent["sg_message_id"] + "<br>" +
                "</p>";

    // Send email
    MailApp.sendEmail({
      to: "fbhewitt@gmail.com",
      subject: sendgridEvent["event"] + ":" + sendgridEvent["email"],
      htmlBody: body
    });
  }
