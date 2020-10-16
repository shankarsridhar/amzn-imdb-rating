const puppeteer = require('puppeteer');
const { writeJson } = require('fs-extra');

async function getAmazonMovies(page) {
  await page.goto('https://www.amazon.com/gp/video/storefront?node=2858905011/');
  const amazonMovies = await page.evaluate(() => {
    const loadMoreInCategory = document.querySelectorAll('button[aria-label="Right"]');
    const buttonCount = document.querySelectorAll('button[aria-label="Right"]').length;
    for (let index = 0; index < buttonCount; index++) {
      // TODO: find a better way instead of hardcoding to 3
      for (let clickCounter = 1; clickCounter <= 4; clickCounter++) {
        loadMoreInCategory[index].click();
      }
    }
    const movieNodes = Array.from(document.querySelectorAll('.tst-title-card a[aria-label]'));
    return movieNodes.map((node) => ({
      name: node.getAttribute('aria-label'),
      link: `https://amazon.com${node.getAttribute('href')}`.replace(/\/ref=\S{1,}/g, ''),
    }));
  });

  return amazonMovies;
}

async function getRatingByMovieName(page, movieName) {
  const movieNameEncoded = movieName.replace(/\s{1,}/g, '+');
  await page.goto(`https://www.imdb.com/search/title/?title=${movieNameEncoded}`);
  const op = await page.evaluate(() => {
    const ratingNode = document.querySelector('.ratings-bar [data-value]');
    if (ratingNode) {
      return ratingNode.getAttribute('data-value');
    }
  });
  return op;
}

const getMovies = async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  const amazonMovies = await getAmazonMovies(page);

  const highlyRatedMovies = [];
  for (const movie of amazonMovies) {
    const rating = parseFloat(await getRatingByMovieName(page, movie.name), 10);
    if (typeof rating === 'number' && rating >= 5.5) {
      highlyRatedMovies.push({ name: movie.name, rating, link: movie.link });
    }
  }

  browser.close();
  return highlyRatedMovies;
};

const updateMovieRatings = async () => {
  const movieList = await getMovies();
  const fileName = 'imdb-ratings-amazon.json';
  await writeJson(fileName, movieList);
  console.log(`Ratings updated into ${fileName}`);
};

module.exports = { getMovies, updateMovieRatings };
