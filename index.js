const express = require('express');
const app = express();

app.get('/', async function (req, res) {
  const { getMovies } = require('./prime');
  const movieList = await getMovies();
  res.send(movieList);
});

app.listen(process.env.PORT || 3000);
