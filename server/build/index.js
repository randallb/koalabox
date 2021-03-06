import express from "express";
import fs from "fs";
import path from "path";
import TOML from "@iarna/toml";
import util from "util";
import errorHandler from "errorHandler";
let dropboxData;

try {
  const dataBuffer = fs.readFileSync(`${process.env.HOME || ""}/.dropbox/info.json`);
  dropboxData = JSON.parse(dataBuffer.toString());
  if (dropboxData.personal == null) throw new Error();
} catch {
  throw new Error("Can't open persoal dropbox information. Is it installed?");
}

const koalaHomePath = dropboxData.personal.path + "/koalabox";
const koalaProjectsPath = `${koalaHomePath}/  Projects`;
const koalaAreasPath = `${koalaHomePath}/ Areas`;
const koalaResourcesPath = `${koalaHomePath}/ Resources`;
const koalaArchivePath = `${koalaHomePath}/Archive`;
const koalaInboxPath = `${koalaHomePath}/Inbox`;
const subPaths = [koalaProjectsPath, koalaAreasPath, koalaResourcesPath, koalaArchivePath, koalaInboxPath];
const pathsToBuild = [koalaHomePath, ...subPaths];

for (let index = 0; index < pathsToBuild.length; index++) {
  const path = pathsToBuild[index];

  if (fs.existsSync(path) !== true) {
    fs.mkdirSync(path);
  }
}

const app = express();
app.use(express.json());

async function getFilesFromKoalaBox() {
  const cache = new Map();

  for (const aPath of subPaths) {
    // $FlowFixMe
    const dirEnt = await fs.promises.opendir(aPath);
    const dirPath = dirEnt.path;
    const dirMap = cache.get(dirPath);

    if (dirMap == null) {
      cache.set(dirPath, new Map());
    }

    for await (const entry of dirEnt) {
      if (entry.name.endsWith("toml")) {
        const file = await fs.promises.readFile(path.join(dirEnt.path, entry.name));
        const dirMap = cache.get(dirPath);
        const entryName = entry.name;
        const data = TOML.parse(file);
        dirMap === null || dirMap === void 0 ? void 0 : dirMap.set(entryName, data);
      }
    }
  }

  return cache;
}

app.get("/", async (req, res, next) => {
  try {
    const cache = await getFilesFromKoalaBox();
    res.json(Object.fromEntries(cache));
  } catch (error) {
    next(error);
  }
});
app.post("/newTodo", async (req, res) => {
  const testTodo = req.body;
  testTodo.createdAt = new Date();
  await fs.promises.writeFile(`${koalaInboxPath}/${testTodo.title}.todo.toml`, TOML.stringify(testTodo));
  console.log("wriggity wrote");
  res.send(`wrote ${testTodo.title}!`);
});
app.use(errorHandler);
app.listen(3000, () => console.log("listening"));