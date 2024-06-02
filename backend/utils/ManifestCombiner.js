const fs = require("node:fs/promises");
const fsync = require("fs");
const { DOMParser, XMLSerializer } = require("@xmldom/xmldom");

const NAMESPACE = "urn:mpeg:dash:schema:mpd:2011";

class MPDCombiner {
  constructor(files, output) {
    this.files = files;
    this.parser = null;
    this.serializer = null;
    this.output = output;

    this.newLineNode = null;

    this.parent = null;
    this.rootDoc = null;
    this.totalDuration = 0;
  }

  resetState() {
    this.files = [];
    this.output = null;

    this.parent = null;
    this.rootDoc = null;
    this.totalDuration = 0;
  }

  addFiles(files) {
    this.files = files;
  }

  setOutput(output) {
    this.output = output;
  }

  getParser() {
    if (!this.parser) {
      this.parser = new DOMParser();
    }

    return this.parser;
  }

  getSerializer() {
    if (!this.serializer) {
      this.serializer = new XMLSerializer();
    }

    return this.serializer;
  }

  getNewLineNode(doc) {
    if (!this.newLineNode) {
      this.newLineNode = doc.createTextNode("\t\n\t");
    }
    return this.newLineNode.cloneNode();
  }

  modifyPeriodAttrib(rootElement, file) {
    let periods = rootElement.getElementsByTagNameNS(NAMESPACE, "Period");
    if (periods.length < 1) {
      throw new Error("No Period elements found in the manifest");
    }

    let period = periods[0];
    let durationString = rootElement.getAttribute("mediaPresentationDuration");

    if (!durationString) {
      throw new Error("Duration attribute not found in MPD manifest");
    }

    let durationS = this.getTimeFromDurationString(durationString);

    // Set the start time
    period.setAttribute(
      "start",
      this.getDurationStringFromTime(this.totalDuration)
    );

    this.totalDuration += durationS;

    period.setAttribute("duration", durationString);
    period.setAttribute("id", file.name);

    return period;
  }

  modifySegmentTemplate(rootElement, file) {
    // add the url to SegmentTemplate

    let segmentTemplates = rootElement.getElementsByTagNameNS(
      NAMESPACE,
      "SegmentTemplate"
    );

    if (segmentTemplates.length < 1) {
      console.error(
        "[MPDCombiner] No SegmentTemplate elements found in the manifest"
      );
      throw new Error("No SegmentTemplate elements found in the manifest");
    }

    for (let i = 0; i < segmentTemplates.length; i++) {
      let segmentTemplate = segmentTemplates[i];

      segmentTemplate.setAttribute(
        "initialization",
        file.name + "/" + segmentTemplate.getAttribute("initialization")
      );

      segmentTemplate.setAttribute(
        "media",
        file.name + "/" + segmentTemplate.getAttribute("media")
      );
    }
  }

  // getTimeFromDurationString(duration) {
  //   let time = 0;
  //   let hours = 0;
  //   let minutes = 0;
  //   let seconds = 0;

  //   if (!duration) {
  //     console.error("Duration string not provided");
  //     return 0;
  //   }

  //   if (typeof duration !== "string") {
  //     console.error("Invalid duration string:", duration);
  //     return 0;
  //   }

  //   let match = duration.match(/PT((\d+)H)?((\d+)M)?(([\d.]+)S)?/);
  //   if (match) {
  //     hours = match[2] ? parseInt(match[2], 10) : 0;
  //     minutes = match[4] ? parseInt(match[4], 10) : 0;
  //     seconds = match[6] ? parseFloat(match[6]) : 0;
  //   }

  //   time = hours * 3600 + minutes * 60 + seconds;
  //   return time;
  // }

  // getDurationStringFromTime(time) {
  //   let duration = "PT";

  //   let hours = Math.floor(time / 3600);
  //   let minutes = Math.floor((time % 3600) / 60);
  //   let seconds = (time % 60).toFixed(3);

  //   if (hours > 0) {
  //     duration += `${hours}H`;
  //   }
  //   if (minutes > 0) {
  //     duration += `${minutes}M`;
  //   }
  //   duration += `${seconds}S`;

  //   return duration;
  // }

  getTimeFromDurationString(duration) {
    let time = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (!duration) {
      console.error("Duration string not provided");
      return 0;
    }

    if (typeof duration !== "string") {
      console.error("Invalid duration string:", duration);
      return 0;
    }

    let match = duration.match(/PT((\d+)H)?((\d+)M)?(([\d.]+)S)?/);
    if (match) {
      hours = match[2] ? parseInt(match[2], 10) : 0;
      minutes = match[4] ? parseInt(match[4], 10) : 0;
      seconds = match[6] ? parseFloat(match[6]) : 0;
    }

    time = hours * 3600 + minutes * 60 + seconds;
    return parseFloat(time.toFixed(3));
  }

  getDurationStringFromTime(time) {
    let duration = "PT";

    let hours = Math.floor(time / 3600);
    let minutes = Math.floor((time % 3600) / 60);
    let seconds = (time % 60).toFixed(6);

    if (hours > 0) {
      duration += `${hours}H`;
    }
    if (minutes > 0) {
      duration += `${minutes}M`;
    }
    duration += `${seconds}S`;

    return duration;
  }

  async getCombinedManifest() {
    /* STEPS TO RUN
     * Get files
     * Read the file content
     * Modify the MPD file in sequence
     * Write the modified content to a new file
     */

    // Read the first file

    if (!this.files) {
      console.error("[MPDCombiner] No files provided");
      return;
    }

    if (!this.output) {
      console.error("[MPDCombiner] No output file provided");
      return;
    }

    if (this.files.length < 2) {
      console.error("[MPDCombiner] No files found to combine");
      return;
    }

    try {
      const start = new Date();
      const data = await fs.readFile(this.files[0].file, "utf8");
      this.parseInitialManifest(this.files[0], data);

      const filePromises = this.files.slice(1).map((file) => {
        return fs.readFile(file.file, "utf8");
      });

      const filesData = await Promise.all(filePromises);

      filesData.forEach((data, index) => {
        this.appendManifestToParent(this.files[index + 1], data);
      });

      this.parent.setAttribute(
        "mediaPresentationDuration",
        this.getDurationStringFromTime(this.totalDuration)
      );

      const combinedManifest = this.getSerializer().serializeToString(
        this.parent
      );

      const finalManifest = `<?xml version="1.0" ?>\n${combinedManifest}`;

      await fs.writeFile(this.output, finalManifest);

      const end = new Date();
      console.log("Time taken:", end - start, "ms");

      return end - start;
    } catch (err) {
      console.error("[MPDCombiner] Error :", err);
    }
  }

  parseInitialManifest(file, mpdFileString) {
    // This is the first manifest file in sequence
    // Parse and store the parent manifest
    console.log("[MPDCombiner] Parsing initial manifest");
    const parser = this.getParser();

    const doc = parser.parseFromString(mpdFileString, "text/xml");
    this.rootDoc = doc;

    let mpds = doc.getElementsByTagNameNS(NAMESPACE, "MPD");

    if (mpds.length < 1) {
      console.error("[MPDCombiner] No MPD elements found in the manifest");
      throw new Error("No MPD elements found in the manifest");
    }

    this.parent = mpds[0];

    if (!this.parent) {
      console.error(
        "[MPDCombiner] Parent MPD element not found in MPD manifest"
      );
      throw new Error("Parent MPD element not found in MPD manifest");
    }

    this.modifyPeriodAttrib(this.parent, file);

    this.modifySegmentTemplate(this.parent, file);

    console.log("[MPDCombiner] Initial manifest parsed successfully");
  }

  appendManifestToParent(file, mpdFileString) {
    // Parse the MPD string using DOMParser
    const parser = this.getParser();
    const doc = parser.parseFromString(mpdFileString, "text/xml");

    let mpds = doc.getElementsByTagNameNS(NAMESPACE, "MPD");

    if (mpds.length < 1) {
      console.error("No MPD elements found in the manifest");
      return;
    }

    let root = mpds[0];

    let period = this.modifyPeriodAttrib(root, file);

    this.modifySegmentTemplate(root, file);

    this.parent.appendChild(this.getNewLineNode(doc));
    this.parent.appendChild(doc.createComment(file.name));
    this.parent.appendChild(this.getNewLineNode(doc));
    this.parent.appendChild(period);
    this.parent.appendChild(this.getNewLineNode(doc));
  }
}

// export const mpdCombiner = new MPDCombiner();
const output = "./to_upload.mpd";

const content = fsync.readFileSync("new_files.json");

const files = JSON.parse(content);

const mpdCombiner = new MPDCombiner(files, output);
mpdCombiner.getCombinedManifest();
