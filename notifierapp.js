const express = require('express')
const app = express()
const port = 3000
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');




app.get('/', (req, res) => {
  res.send('Hello World!')

  db.serialize(function() {

    db.run('CREATE TABLE lorem (info TEXT)');
    var stmt = db.prepare('INSERT INTO lorem VALUES (?)');

    for (var i = 0; i < 10; i++) {
      stmt.run('Ipsum ' + i);
      console.log('ipsum bla')
    }

    stmt.finalize();

    db.each('SELECT rowid AS id, info FROM lorem', function(err, row) {
      console.log(row.id + ': ' + row.info);
    });
  });

  db.close();


})

app.get('/api/members', (req,res) => {
  res.json(members);
})



app.listen(process.env.PORT || port, () => console.log(`server listening at http://localhost: ${port} `));
