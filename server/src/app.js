// @flow
import express from "express";
import fs from "fs";
import path from "path";
import TOML from "@iarna/toml";
import util from "util";

import type { $Request, $Response, NextFunction, Middleware } from "express";

type DropboxDetails = {
  path: string,
  host: number,
  is_team: boolean,
  subscription_type: "Pro" | "Free",
};
type DropboxData = {
  personal?: DropboxDetails,
  team?: DropboxDetails,
};

let dropboxData: DropboxData;
try {
  const dataBuffer = fs.readFileSync(
    `${process.env.HOME || ""}/.dropbox/info.json`
  );
  dropboxData = (JSON.parse(dataBuffer.toString()): DropboxData);
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

const subPaths = [
  koalaProjectsPath,
  koalaAreasPath,
  koalaResourcesPath,
  koalaArchivePath,
  koalaInboxPath,
];

const pathsToBuild = [koalaHomePath, ...subPaths];

for (let index = 0; index < pathsToBuild.length; index++) {
  const path = pathsToBuild[index];
  if (fs.existsSync(path) !== true) {
    fs.mkdirSync(path);
  }
}

const app = express();
app.use(express.json());

type Todo = {
  description: string,
};

async function getFilesFromKoalaBox() {
  const cache = new Map();
  for (const aPath of subPaths) {
    // $FlowFixMe
    const dirEnt = await fs.promises.opendir(aPath);
    const dirPath = (dirEnt.path: string);
    const dirMap = cache.get(dirPath);
    if (dirMap == null) {
      cache.set(dirPath, new Map());
    }
    for await (const entry of dirEnt) {
      if (entry.name.endsWith("toml")) {
        console.log(entry.name.endsWith("toml"));
        const file = await fs.promises.readFile(
          path.join(dirEnt.path, entry.name)
        );
        const dirMap = cache.get(dirPath);
        const entryName = (entry.name: string);
        const data = TOML.parse<Todo>(file);
        dirMap?.set(entryName, data);
      }
    }
  }
  return cache;
}

app.get("/", async (req: $Request, res: $Response, next: NextFunction) => {
  try {
    const cache = await getFilesFromKoalaBox();
    res.json(Object.fromEntries(cache));
  } catch (error) {
    next(error);
  }
});

app.post("/newTodo", async (req: $Request, res: $Response) => {
  const testTodo = req.body;
  testTodo.createdAt = new Date();
  const title = testTodo.title ?? "lol";
  await fs.promises.writeFile(
    `${koalaInboxPath}/${title}.todo.toml`,
    TOML.stringify(testTodo)
  );
  console.log("wriggity wrote ", title);
  res.send(`wrote ${title}!`);
});

app.use((_req, res: $Response) => {
  res.sendStatus(404);
});

export default app;
