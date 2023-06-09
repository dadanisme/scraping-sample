import { Browser, Locator } from "playwright-core";

export const getGeneralData = async (
  item: Locator,
  url: string
): Promise<any> => {
  const allData = item.locator("div.ListingCell-AllInfo.ListingUnit");
  const category = await allData.getAttribute("data-category");
  const subCategories = await allData.getAttribute("data-subcategories");
  const geoPoint = await allData.getAttribute("data-geo-point");
  const sku = await allData.getAttribute("data-sku");
  const yearBuilt = await allData.getAttribute("data-year_built");
  const carSpaces = await allData.getAttribute("data-car_spaces");
  const bedrooms = await allData.getAttribute("data-bedrooms");
  const bathrooms = await allData.getAttribute("data-bathrooms");
  const electricity = await allData.getAttribute("data-electricity");

  const price = await item.locator(".PriceSection-FirstPrice").innerText();
  const title = await item.locator(".ListingCell-KeyInfo-title").innerText();
  const address = await item
    .locator(".ListingCell-KeyInfo-address-text")
    .innerText();
  const description = await item
    .locator(".ListingCell-shortDescription")
    .innerText();
  const thumbnail = await item.locator("img").first().getAttribute("src");
  const imageCount = await item.locator(".ListingCell-ImageCount").innerText();

  const informationContainer = item.locator(".KeyInformation-attribute_v2");
  const allInformation = await informationContainer.all();
  const information = await Promise.all(
    allInformation.map(async (information) => {
      const label = await information
        .locator(".KeyInformation-label_v2")
        .innerText();
      const value = await information
        .locator(".KeyInformation-value_v2")
        .innerText();
      return { label, value };
    })
  );

  const mainData = {
    title,
    address,
    short_description: description,
    price,
    information,
    thumbnail,
    imageCount,
    category,
    sub_categories: JSON.parse(String(subCategories)) || null,
    coordinate: JSON.parse(String(geoPoint)) || null,
    sku,
    year_built: yearBuilt || null,
    car_spaces: carSpaces || null,
    bedrooms: bedrooms || null,
    bathrooms: bathrooms || null,
    electricity: electricity || null,
    listing_type: url.includes("/rent/")
      ? "rent"
      : url.includes("/buy/")
      ? "buy"
      : null,
  };

  return { ...mainData };
};

export const getDetails = async (
  url: string,
  browser: Browser
): Promise<any> => {
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle", timeout: 0 });

  const title = await page.locator("h1.Title-pdp-title").innerText();
  const address = await page.locator("h3.Title-pdp-address").innerText();
  const price = await page.locator("div.Title-pdp-price").innerText();

  const currency = price.split(" ")[0];

  const description = await page
    .locator("div.ViewMore-text-description")
    .first()
    .allInnerTexts();

  const vendor = await page
    .locator("div.AgentInfoV2-agent-name")
    .first()
    .innerText();
  const vendorImage = await page
    .locator("img.AgentInfoV2-agent-portrait")
    .first()
    .getAttribute("src");

  const vendorAgency = await page
    .locator("div.AgentInfoV2-agent-agency")
    .first()
    .innerText();

  const showNumber =
    "a.AgentInfoV2-requestPhoneSection-showNumber.js-phoneLeadShowNumber";

  await page.locator(showNumber).first().click();
  await page.waitForTimeout(2000);

  const vendorPhone = await page
    .locator("div.LeadSuccess-phone")
    .allInnerTexts();

  await page.keyboard.press("Escape");
  await page.locator("div.Banner-Images").first().click();

  const banner = page.locator("div.Banner-Wrapper");

  await page.waitForTimeout(2000);

  const images = banner.locator("img");
  const sliderImages = page.locator("img.Header-pdp-inner-image");
  const allImages = [...(await images.all()), ...(await sliderImages.all())];

  const imageUrls = await Promise.all(
    allImages.map(async (image) => {
      return await image.getAttribute("src");
    })
  );

  await page.keyboard.press("Escape");

  const listings = page.locator("div.listing-section.listing-details");
  const allListings = await listings.locator("div.columns-2").all();

  const listingData = await Promise.all(
    allListings.map(async (listing) => {
      const label = await listing.locator("div.ellipsis").innerText();
      const value = await listing.locator("div.last").innerText();
      return { label, value };
    })
  );

  const ammenities = page.locator("span.listing-amenities-name");
  const allAmmenities = await ammenities.all();

  const ammenitiesData = await Promise.all(
    allAmmenities.map(async (ammenity) => {
      return await ammenity.innerText();
    })
  );

  const nearbies = await page.locator("ul.landmark-left-link").allInnerTexts();

  await page.close();

  return {
    title,
    images: imageUrls.filter((url) => Boolean(url)),
    address,
    price,
    currency,
    description: description.join(""),
    vendor: {
      name: vendor,
      image: vendorImage,
      phones: vendorPhone.join("").split("\n"),
      agency: vendorAgency,
    },
    listings: listingData,
    ammenities: ammenitiesData,
    nearbies,
  };
};
