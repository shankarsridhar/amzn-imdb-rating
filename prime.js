const puppeteer = require('puppeteer');

async function getAmazonMovies(page) {
  await page.goto('https://www.amazon.com/gp/video/storefront?node=2858905011/');
  const amazonMovies = await page.evaluate(() => {
    let movieNodes = document.querySelectorAll('.tst-title-card a[aria-label]');
    const movieNames = [];
    for (const node of movieNodes) {
      movieNames.push(node.getAttribute('aria-label'));
    }
    return movieNames;
  });

  return amazonMovies;
}

async function getRatingByMovieName(page, movieName) {
  const movieNameEncoded = encodeURI(movieName);
  console.log('movieNameEncoded', movieNameEncoded);
  await page.goto(`https://www.imdb.com/search/title/?title=${movieNameEncoded}`);
  // await page.goto(`https://www.imdb.com/search/title/?title=madmax`);
  return page.evaluate(() =>
    document.querySelector('.ratings-bar [data-value]').getAttribute('data-value')
  );
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const amazonMovies = await getAmazonMovies(page);
  console.log(amazonMovies);

  for (const movieName of amazonMovies) {
    await getRatingByMovieName(page, movieName);
  }

  browser.close();
})();
