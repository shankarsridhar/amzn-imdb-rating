const puppeteer = require('puppeteer');

async function getAmazonMovies(page) {
  await page.goto('https://www.amazon.com/gp/video/storefront?node=2858905011/');
  const amazonMovies = await page.evaluate(() => {
    const loadMoreInCategory = document.querySelectorAll('button[aria-label="Right"]');
    const buttonCount = document.querySelectorAll('button[aria-label="Right"]').length;
    // for (let index = 0; index < buttonCount; index++) {
    //   for (let clickCounter = 1; clickCounter <= 3; clickCounter++) {
    //     loadMoreInCategory[index].click();
    //   }
    // }
    const movieNodes = Array.from(document.querySelectorAll('.tst-title-card a[aria-label]'));
    return movieNodes.map((node) => ({
      name: node.getAttribute('aria-label'),
      link: node.getAttribute('href'),
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
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const amazonMovies = await getAmazonMovies(page);

  const highlyRatedMovies = [];
  for (const movie of amazonMovies) {
    const rating = await getRatingByMovieName(page, movie.name);
    if (rating && parseInt(rating, 10) > 5) {
      highlyRatedMovies.push({ name: movie.name, rating, link: movie.link });
    }
  }

  console.log(highlyRatedMovies);
  return highlyRatedMovies;

  browser.close();
};

module.exports = { getMovies };
