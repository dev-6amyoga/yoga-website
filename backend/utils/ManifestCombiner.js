const fs = require('node:fs/promises')
const fsync = require('fs')
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom')

const NAMESPACE = 'urn:mpeg:dash:schema:mpd:2011'

class MPDCombiner {
  constructor(files, output) {
    this.files = files
    this.parser = null
    this.serializer = null
    this.output = output

    this.newLineNode = null

    this.parent = null
    this.rootDoc = null
    this.totalDuration = 0

    this.sections = []
  }

  resetState() {
    this.files = []
    this.output = null

    this.parent = null
    this.rootDoc = null
    this.totalDuration = 0
  }

  addFiles(files) {
    this.files = files
  }

  setOutput(output) {
    this.output = output
  }

  getParser() {
    if (!this.parser) {
      this.parser = new DOMParser()
    }

    return this.parser
  }

  getSerializer() {
    if (!this.serializer) {
      this.serializer = new XMLSerializer()
    }

    return this.serializer
  }

  getNewLineNode(doc) {
    if (!this.newLineNode) {
      this.newLineNode = doc.createTextNode('\t\n\t')
    }
    return this.newLineNode.cloneNode()
  }

  saveSection(file) {
    this.sections.push({
      name: file.original,
      time: this.totalDuration,
    })
  }

  modifyPeriodAttrib(rootElement, file) {
    // modifies the duration and id of Period, returns Period element

    if (!rootElement) {
      console.error('Root element not provided')
      return
    }

    // Find the Period element, add duration attribute
    let periods = rootElement.getElementsByTagNameNS(NAMESPACE, 'Period')

    if (periods.length < 1) {
      console.error('[MPDCombiner] No Period elements found in the manifest')
      throw new Error('No Period elements found in the manifest')
    }

    let period = periods[0]
    let durationString = rootElement.getAttribute('mediaPresentationDuration')

    if (!durationString) {
      throw new Error('Duration attribute not found in MPD manifest')
    }

    let durationS = this.getTimeFromDurationString(durationString)

    // Set the start time
    period.setAttribute(
      'start',
      this.getDurationStringFromTime(this.totalDuration)
    )

    this.saveSection(file)

    // update total duration
    this.totalDuration += durationS

    period.setAttribute('duration', durationString)
    period.setAttribute('id', file.name)

    return period
  }

  modifySegmentTemplate(rootElement, file) {
    // add the url to SegmentTemplate

    let segmentTemplates = rootElement.getElementsByTagNameNS(
      NAMESPACE,
      'SegmentTemplate'
    )

    if (segmentTemplates.length < 1) {
      console.error(
        '[MPDCombiner] No SegmentTemplate elements found in the manifest'
      )
      throw new Error('No SegmentTemplate elements found in the manifest')
    }

    for (let i = 0; i < segmentTemplates.length; i++) {
      let segmentTemplate = segmentTemplates[i]

      segmentTemplate.setAttribute(
        'initialization',
        file.name + '/' + segmentTemplate.getAttribute('initialization')
      )

      segmentTemplate.setAttribute(
        'media',
        file.name + '/' + segmentTemplate.getAttribute('media')
      )
    }
  }

  modifySegmentBaseURL(rootElement, file) {
    // add the file name to BaseURL to point to the correct file

    // get all representations
    let representations = rootElement.getElementsByTagNameNS(
      NAMESPACE,
      'Representation'
    )

    if (representations.length < 1) {
      throw new Error('No Representation elements found in the manifest')
    }

    // get all BaseURL elements in the representation, update the URL

    for (let i = 0; i < representations.length; i++) {
      let representation = representations[i]

      let baseURLs = representation.getElementsByTagNameNS(NAMESPACE, 'BaseURL')

      for (let j = 0; j < baseURLs.length; j++) {
        let baseURL = baseURLs[j]

        let newURL = file.name + '/' + baseURL.textContent
        baseURL.textContent = newURL
      }
    }
  }

  getTimeFromDurationString(duration) {
    let time = 0
    let hours = 0
    let minutes = 0
    let seconds = 0

    if (!duration) {
      console.error('Duration string not provided')
      return 0
    }

    if (typeof duration !== 'string') {
      console.error('Invalid duration string:', duration)
      return 0
    }

    let match = duration.match(/PT((\d+)H)?((\d+)M)?(([\d.]+)S)?/)
    if (match) {
      hours = match[2] ? parseInt(match[2], 10) : 0
      minutes = match[4] ? parseInt(match[4], 10) : 0
      seconds = match[6] ? parseFloat(match[6]) : 0
    }

    time = hours * 3600 + minutes * 60 + seconds
    return parseFloat(time.toFixed(3))
  }

  getDurationStringFromTime(time) {
    let duration = 'PT'

    let hours = Math.floor(time / 3600)
    let minutes = Math.floor((time % 3600) / 60)
    let seconds = (time % 60).toFixed(6)

    if (hours > 0) {
      duration += `${hours}H`
    }
    if (minutes > 0) {
      duration += `${minutes}M`
    }
    duration += `${seconds}S`

    return duration
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
      console.error('[MPDCombiner] No files provided')
      return
    }

    // if (!this.output) {
    // 	console.error("[MPDCombiner] No output file provided");
    // 	return;
    // }

    // if (this.files.length < 2) {
    // 	console.error("[MPDCombiner] No files found to combine");
    // 	return;
    // }

    try {
      const start = new Date()
      // const data = await fs.readFile(this.files[0].file, "utf8");

      if (!this.files[0].url) {
        throw new Error('[MPDCombiner] No URL provided for file')
      }

      if (!this.files[0].name) {
        throw new Error('[MPDCombiner] No name provided for file')
      }

      const res = await fetch(this.files[0].url, { method: 'GET' })
      let data = await res.text()

      console.log(this.files[0].url)

      if (this.files.length < 2) {
        // Only one file, no need to combine
        return data
      }

      this.parseInitialManifest(this.files[0], data)

      // all files except the first one
      const filePromises = this.files.slice(1).map(async (file) => {
        if (!file.url) {
          throw new Error('[MPDCombiner] No URL provided for file')
        }

        if (!file.name) {
          throw new Error('[MPDCombiner] No name provided for file')
        }

        const res = await fetch(file.url, { method: 'GET' })
        return await res.text()
      })

      const filesData = await Promise.all(filePromises)

      filesData.forEach((data, index) => {
        this.appendManifestToParent(this.files[index + 1], data)
      })

      this.parent.setAttribute(
        'mediaPresentationDuration',
        this.getDurationStringFromTime(this.totalDuration)
      )

      const combinedManifest = this.getSerializer().serializeToString(
        this.parent
      )

      const finalManifest = `<?xml version="1.0" ?>\n${combinedManifest}`

      if (this.output) {
        await fs.writeFile(this.output, finalManifest)
      }

      const end = new Date()
      console.log('Time taken to combine mpd:', end - start, 'ms')

      return [finalManifest, this.totalDuration, this.sections]
    } catch (err) {
      console.error('[MPDCombiner] Error :', err)
      throw err
    }
  }

  parseInitialManifest(file, mpdFileString) {
    // This is the first manifest file in sequence
    // Parse and store the parent manifest
    console.log('[MPDCombiner] Parsing initial manifest')
    const parser = this.getParser()

    const doc = parser.parseFromString(mpdFileString, 'text/xml')
    this.rootDoc = doc

    let mpds = doc.getElementsByTagNameNS(NAMESPACE, 'MPD')

    if (mpds.length < 1) {
      console.error('[MPDCombiner] No MPD elements found in the manifest')
      throw new Error('No MPD elements found in the manifest')
    }

    this.parent = mpds[0]

    if (!this.parent) {
      console.error(
        '[MPDCombiner] Parent MPD element not found in MPD manifest'
      )
      throw new Error('Parent MPD element not found in MPD manifest')
    }

    this.modifyPeriodAttrib(this.parent, file)

    // this.modifySegmentTemplate(this.parent, file);
    this.modifySegmentBaseURL(this.parent, file)

    console.log('[MPDCombiner] Initial manifest parsed successfully')
  }

  appendManifestToParent(file, mpdFileString) {
    // Parse the MPD string using DOMParser

    const parser = this.getParser()
    const doc = parser.parseFromString(mpdFileString, 'text/xml')

    let mpds = doc.getElementsByTagNameNS(NAMESPACE, 'MPD')

    if (mpds.length < 1) {
      console.error('No MPD elements found in the manifest')
      return
    }

    let root = mpds[0]

    let period = this.modifyPeriodAttrib(root, file)

    // this.modifySegmentTemplate(root, file);
    this.modifySegmentBaseURL(root, file)

    this.parent.appendChild(this.getNewLineNode(doc))
    this.parent.appendChild(doc.createComment(file.name))
    this.parent.appendChild(this.getNewLineNode(doc))
    this.parent.appendChild(period)
    this.parent.appendChild(this.getNewLineNode(doc))
  }
}

module.exports = {
  MPDCombiner,
}
