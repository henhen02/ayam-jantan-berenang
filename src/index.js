const puppeteer = require("puppeteer");
const fs = require("fs");

const mainUrl =
  "https://museumketransmigrasian.lampungprov.go.id/post/all?page=";
const pageLimit = 8;
let data = [];

const getArticleLink = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  const articles = [];
  for (let i = 1; i <= pageLimit; i++) {
    await page.goto(mainUrl + i);
    await page.waitForSelector(".single-post-text > h2 > a");
    const result = await page.evaluate(() => {
      const articles = Array.from(
        document.querySelectorAll(".single-post-text > h2 > a")
      );
      return articles.map((article) => ({
        title: article.innerText,
        link: article.href,
      }));
    });
    articles.push(...result);
    data = articles;
  }
  await browser.close();
};

const getArticleViewer = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  for (let i = 0; i < data.length; i++) {
    await page.goto(data[i].link);
    await page.waitForSelector(
      ".single-post-thumb-overlay > .post-meta > ul > li:last-child > a"
    );
    const result = await page.evaluate(() => {
      const viewer = document
        .querySelector(
          ".single-post-thumb-overlay > .post-meta > ul > li:last-child > a"
        )
        .textContent.split(" ")[1];
      return viewer;
    });

    const date = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "full",
      timeStyle: "short",
    });

    data[i].accessed = date;
    data[i].viewer = result;
  }

  await browser.close();
  fs.unlinkSync("./data.json");
  fs.writeFileSync("./data.json", JSON.stringify(data));
};

(async () => {
  await getArticleLink();
  await getArticleViewer();
})();
