const fs = require("fs");
const axios = require("axios");

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
  const submodules = new Set();

  for (let file of files) {
    const [id, extension] = file.split(".");
    if (extension) {
      if (extension === "json") await read(`${path}/nodes/${file}`, id, ob);
    } else {
      // submodule
      submodules.add(id);
      // await read(`${path}/nodes/${id}/nodes/${id}.json`, id, ob, 400);
    }
  }

  const results = await Promise.all(
    Array.from(submodules).map(
      id =>
        new Promise((res, rej) => {
          axios
            .get(
              `http://localhost:3330/${org}/${id}/raw/branch/master/nodes/${id}.json`
            )
            .then(({ data }) => res({ id, data }))
            .catch(rej);
        })
    )
  );

  results.forEach(({ id, data: { text } }) => {
    const _type = "400";

    ob[_type] = ob[_type] || {};
    ob[_type][id] = [text];

    console.log(`ob[${_type}][${id}] = [${text}];`);
  });

  // for (let id of submodules) {
  //   const { data } = await ;
  //   console.log(data);
  // }

  return ob;
};

// const filepath = `${org}__${repo}.json`;
// const stream = fs.createWriteStream(filepath);
// stream.write(JSON.stringify(ob));
// stream.end();
