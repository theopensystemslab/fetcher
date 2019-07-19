const fs = require("fs");

async function read(file, id, ob, type = undefined) {
  try {
    const { _type, ...data } = JSON.parse(await fs.promises.readFile(file));

    const $type = type || _type;

    ob[$type] = ob[$type] || {};

    ob[$type][id] = [data.text];
  } catch (e) {
    console.error(e);
  }
}

module.exports = async function go(path = ".", org, repo) {
  const files = await fs.promises.readdir(`${path}/nodes`);

  let ob = {};

  for (let file of files) {
    const [id, extension] = file.split(".");
    if (extension) {
      if (extension === "json") await read(`${path}/nodes/${file}`, id, ob);
    } else {
      // submodule
      await read(`${path}/nodes/${id}/nodes/${id}.json`, id, ob, 400);
    }
  }

  // const filepath = `${org}__${repo}.json`;
  // const stream = fs.createWriteStream(filepath);
  // stream.write(JSON.stringify(ob));
  // stream.end();

  return ob;
};
