const puppeteer = require('puppeteer');
const { writeJson } = require('fs-extra');

async function getAmazonMovies(page) {
  await page.goto('https://www.amazon.com/gp/video/storefront/');
  const amazonMovies = await page.evaluate(() => {
    const loadMoreInCategory = document.querySelectorAll('button[aria-label="Right"]');
    const buttonCount = document.querySelectorAll('button[aria-label="Right"]').length;
    for (let index = 0; index < buttonCount; index++) {
      // TODO: find a better way instead of hardcoding to 3
      for (let clickCounter = 1; clickCounter <= 5; clickCounter++) {
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

async function getImdbInfoMovieName(page, movieName) {
  const movieNameEncoded = movieName.replace(/\s{1,}/g, '+');

  await page.goto(`https://www.imdb.com/search/title/?title=${movieNameEncoded}`);
  const imdbInfo = await page.evaluate(() => {
    // const resultItemNode = document.querySelector('.lister-item');
    const linkNode = document.querySelector('.lister-item-image a[href*="title/"]');
    const thumbnailNode = document.querySelector('.lister-item-image a[href*="title/"] img');
    const ratingNode = document.querySelector('.ratings-bar [data-value]');

    if (ratingNode) {
      return {
        rating: ratingNode.getAttribute('data-value'),
        imdbLink: `https://imdb.com${linkNode.getAttribute('href')}`.replace(
          /\/\?ref_=\S{1,}/g,
          ''
        ),
        imdbThumbnail: thumbnailNode.getAttribute('src').replace(/\/ref=\S{1,}/g, ''),
      };
    } else {
      return {};
    }
  });
  return imdbInfo;
}

const getMovies = async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  const amazonMovies = await getAmazonMovies(page);

  const highlyRatedMovies = [];
  for (const movie of amazonMovies) {
    const aa = await getImdbInfoMovieName(page, movie.name);

    const { rating, imdbLink, imdbThumbnail } = aa;
    console.log(aa);
    const numRating = parseFloat(rating, 10);
    if (!isNaN(numRating) && numRating >= 5.5) {
      highlyRatedMovies.push({
        name: movie.name,
        rating: numRating,
        link: movie.link,
        imdbLink,
        imdbThumbnail,
      });
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
