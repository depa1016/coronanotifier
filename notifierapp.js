const express = require('express')
const app = express()
const port = 3000
var sqlite3 = require('sqlite3').verbose();

//Verbinde mit DB
//let db = new sqlite3.Database('./db/contactpeople.db', sqlite3.OPEN_READWRITE, (err) => {
let db = new sqlite3.Database(':memory:', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the contactpeople database.');
  }
});

//Um JSON Files zu handlen
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
var html = '<h1>Coronanotifier</h1> Die folgenden Personen wurden benachrichtigt: <p>'

//HTTP Funktionen
app.get('/', (req, res) => {
  console.log('get ausgeführt')
  html = '<h1>Coronanotifier</h1> Die folgenden Personen wurden benachrichtigt: <p>'

  db.all('select * from contactpeopletable', [], (err, rows) => {
  if (err) {
    throw err;
  }
  html = html.concat("<style>table, td, th {border: 1px solid black;}table {width: 100%;border-collapse: collapse;}</style>")
  html = html.concat("<p><table>")
  html = html.concat("<tr><th>Vorname</th><th>Nachname</th><th>Land</th><th>Stadt</th><th>Postleitzahl</th><th>Straße</th><th>Hausnummer</th><th>E-Mail</th><th>Festnetz</th><th>Mobil</th><th>Arbeit</th></tr>")
  rows.forEach((row) => {
    console.log(row.contact_firstname);
    html = html.concat("<tr><td>"+row.contact_firstname+"</td><td>"+row.contact_lastname+"</td><td>"+row.contact_address_country+"</td><td>"+row.contact_address_city+"</td><td>"+row.contact_address_plz+"</td><td>"+row.contact_address_street+"</td><td>"+row.contact_address_housenumber+"</td><td>"+row.contact_mail_address+"</td><td>"+row.contact_telephone_number_1+"</td><td>"+row.contact_telephone_number_2+"</td><td>"+row.contact_telephone_number_3+"</td></tr>")
  });
  });
  html = html.concat("</table>")

  res.send(html)

})


//HTTP Post
app.post('/notify', (req, res) => {
  //handle the possibility of only one contactperson -> in this case modify json to fit logic
  var jsonContainsMultipleElements = JSON.stringify(req.body).startsWith("[")
  if(!jsonContainsMultipleElements) {
    var newReqBody = JSON.stringify(req.body)
    newReqBody = newReqBody.concat("]")
    newReqBody = "[".concat(newReqBody)
    req.body = JSON.parse(newReqBody)
  }
  //Ininitalisiere DB und erstelle Table falls er noch nicht existiert
  db.serialize(function() {
     db.run('CREATE TABLE if not exists contactpeopletable (contact_firstname TEXT, contact_lastname TEXT, contact_address_country TEXT, contact_address_city TEXT, contact_address_plz INTEGER, contact_address_street TEXT, contact_address_housenumber INTEGER, contact_mail_address TEXT UNIQUE, contact_telephone_number_1 TEXT, contact_telephone_number_2 TEXT, contact_telephone_number_3 TEXT, contact_has_been_notified INTEGER)');
     for(var cpersonid in req.body) {
       var cperson = req.body[cpersonid]

       db.run('INSERT INTO contactpeopletable (contact_address_city, contact_address_country, contact_address_housenumber, contact_address_plz, contact_address_street, contact_firstname, contact_lastname, contact_has_been_notified, contact_mail_address, contact_telephone_number_1, contact_telephone_number_2, contact_telephone_number_3) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', [cperson.contact_address_city,cperson.contact_address_country,cperson.contact_address_housenumber,cperson.contact_address_plz,cperson.contact_address_street,cperson.contact_firstname,cperson.contact_lastname,cperson.contact_has_been_notified,cperson.contact_mail_address,cperson.contact_telephone_number_1,cperson.contact_telephone_number_2,cperson.contact_telephone_number_3], (err) => {
         if (err) {
           console.error(err.message);
         } else {
           console.log("successfully inserted data")
         }
       });
       html = html.concat("<li>" + cperson.contact_firstname + " " + cperson.contact_lastname + " wurde über folgende Wege kontaktiert: <p><table style='width:50%;border-collapse:collapse;border:1px solid black;'>");
       if(cperson.contact_mail_address){
         html = html.concat("<tr><td>E-Mail</td><td>"+cperson.contact_mail_address+"</td></tr>")
       }
       if(cperson.contact_telephone_number_1){
         html = html.concat("<tr><td>Festnetz</td><td>"+cperson.contact_telephone_number_1+"</td></tr>")
       }
       if(cperson.contact_telephone_number_2){
         html = html.concat("<tr><td>Mobil</td><td>"+cperson.contact_telephone_number_2+"</td></tr>")
       }
       if(cperson.contact_telephone_number_3){
         html = html.concat("<tr><td>Arbeit</td><td>"+cperson.contact_telephone_number_3+"</td></tr>")
       }
       html = html.concat("</table>")
    }}
  )
  res.send(html);

});

app.listen(process.env.PORT || port, () => console.log(`server listening at http://localhost: ${port} `));
