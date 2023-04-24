import { chromium } from "playwright";

export const launchBrowser = async (headless = false) => {
  const browser = await chromium.launch({ headless });

  return browser;
};

type Callback = () => Promise<void>;
type ErrorCallback = (error: string) => void;

export const execute = async (callback: Callback, errorCb?: ErrorCallback) => {
  try {
    await callback();
  } catch (error) {
    if (errorCb) {
      if (typeof error === "string") {
        errorCb(error);
      } else {
        errorCb((error as any).message ?? "Unknown error");
      }
    } else {
      throw error;
    }
  }
};
