'use strict';
console.log('Loading event');

var mysql = require('mysql');
var md5   = require('js-md5')

exports.handler = function(event, context, callback) {
  function makeCookieData() {
  var date=new Date();
  date.setTime(+ date + 60*60*24*process.env.CookieTTL); //24 \* 60 \* 60 \* 100
  //var cookieVal = Math.random().toString(36).substring(7); // Generate a random cookie string
  var cookieVal=randomKey(process.env.CookieLength,16)
  //var cookieString = "myCookie="+cookieVal+"; domain=micloud; expires="+date.toGMTString()+";";
  var cookieString = "sessionId="+cookieVal+"; expires="+date.toGMTString()+";";
  return {cookieString,cookieVal,ttl:date.toGMTString()}
}

function randomKey(len,bits){
  bits = bits || 36;
  var outStr = "", newStr;
  while (outStr.length < len)
  {
      newStr = Math.random().toString(bits).slice(2);
      outStr += newStr.slice(0, Math.min(newStr.length, (len - outStr.length)));
  }
  return outStr.toUpperCase();
}
  
  var connection = mysql.createConnection({
  host     : process.env.RDS_HOSTNAME,
  user     : process.env.RDS_USERNAME,
  password : process.env.RDS_PASSWORD,
  port     : process.env.RDS_PORT,
  database : process.env.RDS_DB
});


function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(event.headers.Cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return 0;
}
//"test":event.headers.Cookie.sessionId        WORKING
//context.done(null,{"Cookie":cookieString,"test":getCookie('sessionId')})



connection.connect()

if (getCookie('sessionId')!=0){
  connection.query('SELECT userid FROM sessions WHERE sessionId=?',getCookie('sessionId'),function(error, results, fields){
    if (results[0]){
      //cookie still valid in session
        context.done(null,{"youAre":results[0],"LoginParsed":"Yes"})
    }else{
      //session has expired
        //context.done(null,{"youAre":"Not Logged In"})
        logMeIn()
    }
    //context.done(null,{"Cookie":cookieString,})
})}else{
  //no cookie data
    //context.done(null,{"youAre":"Not Logged In"})
    logMeIn()
}

function logMeIn() {
    connection.query('SELECT  userid, password, firstName, lastName, organisation FROM Micloud.users WHERE username=?',event.body.username,(error, results, fields)=>{
      if (results[0]){
        let md5Password=md5(event.body.password)
        if (md5Password==results[0].password){
          //make login session
          //context.done(null,{"passwordMatch":"yes"})
          let inserts=[makeCookieData().cookieVal,results[0].userid,event.headers["User-Agent"]]
          connection.query('INSERT INTO sessions (sessionId, userId, expiry, userAgent) VALUES(?, ?, NOW() + INTERVAL 7 DAY, ?);',inserts,((error, results, fields)=>{
            connection.end();
            context.done(null,{"feedback":results[0]})
          }))
          //context.done(null,{'Content':makeCookieData().cookieVal,"Agent":event.headers["User-Agent"],"userid":results[0].userId})
          
        }else{
          //Invalid password
          connection.end();
          context.done(null,{'boxType':'error','loggedin': 0,'message': 'Bad username/password'})
        }
        
    }
    })
  //event.body.username
}

  //callback(null, {}); // SUCCESS with message
};
