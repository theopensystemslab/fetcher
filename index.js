const simplegit = require("simple-git");
const express = require("express");
const rimraf = require("rimraf");
const merge = require("./merge");
const cors = require("cors");
const { promisify } = require("util");

const app = express();
app.use(cors());

const PORT = 3000;

async function main({
  org = "wycombe",
  repo = "a15f27be-f63e-411a-8583-3b7170dee4ba"
}) {
  const dir = `tmp/${org}__${repo}`;

  await promisify(rimraf)(dir);

  const url = `http://localhost:3330/${org}/${repo}.git`;

  console.log({ url, dir });

  // await simplegit(".").clone(url, dir, ["--recurse-submodules", "-j8"]);

  await simplegit(".").clone(url, dir, [
    // "--recursive",
    "--shallow-submodules",
    // "--depth 1",
    "-j8"
  ]);

  return await merge(dir, org, repo);
}

app.get("/:org/:repo", async (req, res) => {
  const file = await main(req.params);
  // const data = await fs.promises.readFile("all.json");
  res.send(file);
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
