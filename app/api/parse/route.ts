import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// 解析短链，获取最终跳转URL
async function resolveShortUrl(shortUrl: string): Promise<string> {
  try {
    const response = await fetch(shortUrl, {
      method: "HEAD",
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0",
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        return resolveShortUrl(location);
      }
    }

    return shortUrl;
  } catch (error) {
    console.error("解析短链失败:", error);
    return shortUrl;
  }
}

// 使用 Puppeteer 抓取页面中的音频资源
async function scrapeAudioFromPage(url: string) {
  let browser = null;

  try {
    const executablePath = await chromium.executablePath();

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless as "shell" | boolean,
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
    );

    const audioUrls: Array<{ url: string; type: string }> = [];

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const resourceType = request.resourceType();
      const url = request.url();

      if (
        resourceType === "media" ||
        url.includes(".mp3") ||
        url.includes(".m4a") ||
        url.includes(".aac") ||
        url.includes("audio")
      ) {
        audioUrls.push({ url, type: resourceType });
      }

      request.continue();
    });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Puppeteer v23+ 移除了 waitForTimeout，改用 setTimeout 包装
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const pageInfo = await page.evaluate(() => {
      const result: {
        title: string;
        artist: string;
        cover: string;
        audioSrc: string[];
        pageTitle: string;
        metaDescription: string;
      } = {
        title: "",
        artist: "",
        cover: "",
        audioSrc: [],
        pageTitle: document.title,
        metaDescription: "",
      };

      const titleMeta = document.querySelector('meta[property="og:title"]');
      const descMeta = document.querySelector('meta[property="og:description"]');
      const imageMeta = document.querySelector('meta[property="og:image"]');

      if (titleMeta) result.title = titleMeta.getAttribute("content") || "";
      if (descMeta) result.metaDescription = descMeta.getAttribute("content") || "";
      if (imageMeta) result.cover = imageMeta.getAttribute("content") || "";

      const titleMatch = document.title.match(/(.+?)\s*[-–]\s*(.+)/);
      if (titleMatch && !result.title) {
        result.title = titleMatch[1].trim();
        result.artist = titleMatch[2].trim();
      }

      const audioElements = document.querySelectorAll("audio");
      audioElements.forEach((audio) => {
        if (audio.src) result.audioSrc.push(audio.src);
        const sources = audio.querySelectorAll("source");
        sources.forEach((source) => {
          if (source.src) result.audioSrc.push(source.src);
        });
      });

      const scripts = document.querySelectorAll("script");
      scripts.forEach((script) => {
        const text = script.textContent || "";
        const mp3Matches = text.match(/https?:\/\/[^"'\s]+\.(mp3|m4a|aac)/gi);
        if (mp3Matches) {
          result.audioSrc.push(...mp3Matches);
        }
      });

      const allElements = document.querySelectorAll("*");
      allElements.forEach((el) => {
        const dataSrc = el.getAttribute("data-src") || el.getAttribute("data-audio");
        if (dataSrc && (dataSrc.includes(".mp3") || dataSrc.includes(".m4a"))) {
          result.audioSrc.push(dataSrc);
        }
      });

      return result;
    });

    const allAudioUrls = [
      ...new Set([...audioUrls.map((a) => a.url), ...pageInfo.audioSrc]),
    ].filter((url) => url && url.startsWith("http"));

    const urlObj = new URL(url);
    const mixsongid = urlObj.searchParams.get("mixsongid");

    return {
      success: true,
      originalUrl: url,
      mixsongid,
      title: pageInfo.title || pageInfo.pageTitle,
      artist: pageInfo.artist,
      cover: pageInfo.cover,
      description: pageInfo.metaDescription,
      audioUrls: allAudioUrls,
      audioCount: allAudioUrls.length,
    };
  } catch (error) {
    console.error("抓取失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: "请提供URL" },
        { status: 400 }
      );
    }

    let targetUrl = url;
    if (!url.startsWith("http")) {
      return NextResponse.json(
        { success: false, error: "无效的URL格式" },
        { status: 400 }
      );
    }

    if (url.includes("t.tencentmusic.com")) {
      targetUrl = await resolveShortUrl(url);
    }

    const result = await scrapeAudioFromPage(targetUrl);

    return NextResponse.json(result);
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "服务器内部错误",
      },
      { status: 500 }
    );
  }
}
