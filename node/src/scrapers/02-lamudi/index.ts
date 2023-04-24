import { launchBrowser } from "../../utils";
import { getGeneralData, getDetails } from "./helper";
import * as fs from "fs";

interface LamudiProps {
  query?: string;
  detailed?: boolean;
  type?: "buy" | "rent";
}

const scrapeLamudi = async ({
  query = "",
  detailed = false,
  type = "buy",
}: LamudiProps) => {
  const browser = await launchBrowser();
  const url = `https://www.lamudi.co.id/${type}/?q=${query}`;

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });

  const items = await page.locator("div.ListingCell-wrapper").all();

  let data: any[] = [];
  for (const item of items) {
    const res = await getGeneralData(item, url);

    if (!detailed) data.push(res);

    if (detailed) {
      const link = await item
        .locator(".ListingCell-MainImage > a")
        .getAttribute("href");
      const details = await getDetails(String(link), browser);
      data.push({ ...res, details, url: link });
    }
  }
};

(async () => {
  const data = await scrapeLamudi({
    type: "buy",
    query: "bandung",
    detailed: true,
  });

  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
  console.log("done");
  process.exit(0);
})();
