const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

exports.handler = async (event, context) => {
  let browser = null;
  let screenshot;
  console.log("spawning chrome headless");
  try {
    const executablePath = await chromium.executablePath;

    // setup
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: executablePath,
      headless: chromium.headless,
      defaultViewport: { height: 900, width: 900 },
    });

    // Do stuff with headless chrome
    const page = await browser.newPage();
    const targetUrl = "https://tobi.sh";

    await page.goto(targetUrl, {
      waitUntil: ["domcontentloaded", "networkidle0"],
    });

    screenshot = await page.screenshot({ encoding: "binary" });
  } catch (error) {
    console.log("error", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error,
      }),
    };
  } finally {
    // close browser
    if (browser !== null) {
      await browser.close();
    }
  }

  return {
    statusCode: 200,
    body: screenshot.toString("base64"),
    isBase64Encoded: true,
  };
};
