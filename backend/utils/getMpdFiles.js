const fs = require("node:fs/promises");
const fetch = require("node-fetch"); // Import node-fetch
const path = require("path"); // Import the 'path' module

// read from files.json
const getInfo = async () => {
  // const file = await fs.readFile("files.json", "utf-8");
  const file = await fs.readFile("test-files.json", "utf-8");
  const files = JSON.parse(file);
  const output = files.map(async (f) => {
    const video_url = f.video.asana_dash_url
      ? f.video.asana_dash_url
      : f.video.transition_dash_url;

    const name = video_url
      .split("https://pub-0f821d8aa0b0446cae0613788ad21abc.r2.dev/")[1]
      .split("/stream.mpd")[0];

    const res = await fetch(video_url);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${name} ${res.status}`);
    }

    const content = await res.text();

    const manifestFilePath = path.join(__dirname, "manifests", `${name}.mpd`);

    await fs.writeFile(manifestFilePath, content);

    return {
      name: name,
      url: video_url,
      file: manifestFilePath,
    };
  });

  const result = await Promise.all(output);

  return JSON.stringify(result);
};

getInfo()
  .then((res) => fs.writeFile("new_files.json", res))
  .then((res) => console.log("written to file"))
  .catch((err) => console.error(err));
