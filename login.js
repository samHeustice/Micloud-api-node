'use strict';
console.log('Loading event');

var mysql = require('mysql');
exports.handler = function(event, context, callback) {
  var date=new Date();
  date.setTime(+ date + (10)); //24 \* 60 \* 60 \* 100
  var cookieVal = Math.random().toString(36).substring(7); // Generate a random cookie string
  //var cookieString = "myCookie="+cookieVal+"; domain=micloud; expires="+date.toGMTString()+";";
  var cookieString = "myCookie="+cookieVal+"; expires="+date.toGMTString()+";";
  
  var connection = mysql.createConnection({
  host     : process.env.RDS_HOSTNAME,
  user     : process.env.RDS_USERNAME,
  password : process.env.RDS_PASSWORD,
  port     : process.env.RDS_PORT
});

/*connection.connect()
connection.query('SELECT * FROM Micloud.sessions WHERE userid=4',function(error, results, fields){
    console.log(results[0]);
    connection.end();//,"text":event.Cookie,"testing":"am i a cookie""cookiestuff":event.keys
    context.done(null,{"Cookie":cookieString,"test":event.headers})
    
})*/

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
    return "";
}
//"test":event.headers.Cookie.sessionId        WORKING
//context.done(null,{"Cookie":cookieString,"test":getCookie('sessionId')})

    

/*
connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
})*/

  
  
 
  //callback(null, {}); // SUCCESS with message
};
