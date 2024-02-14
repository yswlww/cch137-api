import path from "path";
import fs from "fs";
import express from "express";
import parseForm from "../utils/parseForm";

const apis = express.Router();

apis.use("/", express.static("public/"));

apis.get("/", (req, res) => {
  res.send({ t: Date.now() });
});

apis.post("/wakeup", (req, res) => {
  res.send("OK");
});

const started = Date.now();
apis.get("/started", (req, res) => {
  res.send({ t: started });
});

apis.get("/dashboard", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../pages/dashboard.html"));
});

import { convertCurrency, getCurrencyList } from "../services/currency";
apis.use("/currency", async (req, res) => {
  const { from, to } = parseForm(req);
  res.send({ rate: await convertCurrency(from, to) });
});
apis.use("/currency-text", async (req, res) => {
  const { from, to } = parseForm(req);
  const rate = await convertCurrency(from, to);
  res.send(`1 ${from} = ${rate} ${to}`);
});
apis.use("/currency-list", async (req, res) => {
  res.send(await getCurrencyList());
});

import translate from "@saipulanuar/google-translate-api";
apis.use("/translate", async (req, res) => {
  const { text, from, to } = parseForm(req);
  res.type("application/json");
  try {
    res.status(200).send(await translate(text, { from, to }));
  } catch (error) {
    res.send({ err: error });
  }
});

import wikipedia from "../services/wikipedia";
apis.use("/wikipedia", async (req, res) => {
  const { query, q, article, a, title, t, page, p, language, lang, l } =
    parseForm(req);
  const searchTerm: string =
    a || q || p || t || query || article || page || title;
  const langCode: string | undefined = l || lang || language;
  if (!searchTerm) return res.status(400).send({ error: "Invalid body" });
  res.type("text/plain; charset=utf-8");
  res.send(await wikipedia(searchTerm, langCode));
});

import { fetchWebpage } from "../services/crawl";
apis.use("/crawl", async (req, res) => {
  const { url } = parseForm(req);
  if (!url) return res.status(400).send({ error: "Invalid body" });
  res.send(await fetchWebpage(url));
});
apis.use("/crawl-text", async (req, res) => {
  const { url } = parseForm(req);
  if (!url) return res.status(400).send({ error: "Invalid body" });
  const { title, description, content } = await fetchWebpage(url);
  res.type("text/plain; charset=utf-8");
  res.send(
    [
      title ? `title:\n${title}` : "",
      description ? `description:\n${description}` : "",
      `content:\n${content}`,
    ]
      .filter((i) => i)
      .join("\n\n")
  );
});

import {
  ddgSearch,
  ddgSearchSummary,
  googleSearch,
  googleSearchSummary,
  googleSearchSummaryV2,
} from "../services/search";
apis.use("/google-search", async (req, res) => {
  const { query } = parseForm(req);
  if (!query) return res.status(400).send({ error: "Invalid body" });
  res.send(await googleSearch(query));
});
apis.use("/ddg-search", async (req, res) => {
  const { query } = parseForm(req);
  if (!query) return res.status(400).send({ error: "Invalid body" });
  res.send(await ddgSearch(query));
});
apis.use("/google-search-summary", async (req, res) => {
  const { query, showUrl = true, v = 2 } = parseForm(req);
  if (!query) return res.status(400).send({ error: "Invalid body" });
  res.type("text/plain; charset=utf-8");
  if (v == 2) res.send(await googleSearchSummaryV2(showUrl, query));
  else res.send(await googleSearchSummary(showUrl, query));
});
apis.use("/ddg-search-summary", async (req, res) => {
  const { query, showUrl = true } = parseForm(req);
  if (!query) return res.status(400).send({ error: "Invalid body" });
  res.type("text/plain; charset=utf-8");
  res.send(await ddgSearchSummary(showUrl, query));
});

import lockerManager, { type LockerOptions } from "../services/lockers";
apis.put("/lockers", (req, res) => {
  const {
    id,
    item,
    options = {},
  } = parseForm(req) as { id?: string; item: any; options: LockerOptions };
  res.type("application/json");
  try {
    if (typeof id === "string")
      res.send(lockerManager.putItem(id, item, options?.privateKey));
    else res.send(lockerManager.addItem(item, options));
  } catch (err) {
    res
      .status(400)
      .send({ name: (err as Error)?.name, message: (err as Error)?.message });
  }
});
apis.post("/lockers", (req, res) => {
  const { id, options = {} } = parseForm(req) as {
    id: string;
    options: LockerOptions;
  };
  res.type("application/json");
  try {
    res.send(lockerManager.getItem(id, options?.privateKey));
  } catch (err) {
    res
      .status(400)
      .send({ name: (err as Error)?.name, message: (err as Error)?.message });
  }
});
apis.delete("/lockers", (req, res) => {
  const { id } = parseForm(req) as { id: string };
  res.type("application/json");
  try {
    res.send(lockerManager.destroyItem(id));
  } catch (err) {
    res
      .status(400)
      .send({ name: (err as Error)?.name, message: (err as Error)?.message });
  }
});

import yadisk from "../services/yadisk";
import ls from "../services/ls";
apis.get("/ls/list", (req, res) => {
  res.type("application/json");
  try {
    res.send(ls.list);
  } catch (err) {
    res.status(500).send(`${err}`);
  }
});
apis.get("/ls/:fn", (req, res) => {
  res.type("application/json");
  try {
    res.send(ls.get(req.params.fn));
  } catch (err) {
    res.status(404).send(`Not Found`);
  }
});
apis.get("/ls/i/:chap_problem", async (req, res) => {
  const chap_problem = req.params.chap_problem;
  const isbn = req.query.b || req.query.isbn;
  const id = req.query.id || chap_problem;
  if (isbn && chap_problem) {
    const filename = `${isbn}_${chap_problem}.png`;
    const fp = path.resolve(`./data/ls/files/${isbn}/${filename}`);
    if (fs.existsSync(fp)) {
      return res.sendFile(fp);
    }
  }
  try {
    const download =
      (req.query.download || req.query.dl || 0).toString() != "0";
    if (!id) throw "NOT FOUND";
    const resource = await yadisk.preview(`https://yadi.sk/i/${id}`);
    res.setHeader(
      "Content-Disposition",
      `${download ? "attachment; " : ""}filename="${resource.filename}"`
    );
    res.type(resource.type);
    if (resource.started) res.send(await resource.data);
    else resource.stream.pipe(res);
  } catch (err) {
    res.redirect(`https://disk.yandex.com/i/${id}`);
    // res.status(404).send(`Not Found`);
  }
});

import { fetchWeather, fetchWeatherText } from "../services/weather";
apis.use("/weather", async (req, res) => {
  const { city, loc, location, unit } = parseForm(req);
  const _city = city || loc || location;
  if (!_city) return res.status(400).send({ error: "Invalid body" });
  res.json(await fetchWeather(_city, unit));
});
apis.use("/weather-text", async (req, res) => {
  const { city, loc, location, unit } = parseForm(req);
  const _city = city || loc || location;
  if (!_city) return res.status(400).send({ error: "Invalid body" });
  res.type("text/plain; charset=utf-8");
  res.send(await fetchWeatherText(_city, unit));
});

apis.use("/test", async (req, res) => {
  const { q } = parseForm(req);
  res.json({ ok: 1, q });
});

export default apis;
