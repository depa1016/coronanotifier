const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/members', (req,res) => {
  res.json(members);
})



app.listen(process.env.PORT || port, () => console.log(`server listening at http://localhost: ${port} `));
