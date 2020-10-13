const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.imdb.com/title/tt0468569/');

  const result = await page.evaluate(() => {
    let rating = document.querySelector('[itemprop="ratingValue"]').innerText;
    let movieName = document.querySelector('.title_wrapper h1').innerText;
    return {
      rating,
      movieName,
    };
  });

  console.log(result);

  browser.close();
})();
