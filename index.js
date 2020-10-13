const express = require('express');
const app = express();

app.get('/imdb-ratings-amazon', async function (req, res) {
  const movieList = require('./imdb-ratings-amazon.json');
  res.send(movieList);
});

app.listen(process.env.PORT || 3000);
