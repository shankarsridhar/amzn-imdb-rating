const express = require('express');
const app = express();
var cors = require('cors');

app.use(
  cors({
    methods: 'GET',
  })
);

app.get('/imdb-ratings-amazon', async function (req, res) {
  const movieList = require('./imdb-ratings-amazon.json');
  res.send(movieList);
});

app.listen(process.env.PORT || 4000);
