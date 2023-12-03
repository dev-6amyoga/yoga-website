import UrlPattern from "url-pattern";
import qs from "query-string";

// Returns YouTube Player API options from a YouTube URL.
//  ie. { playlistId }
//      { videoId, start, end }
//      { query }
export default function parseYouTubeUrl(url) {
  const [domain, querystring] = url.split("?");
  const options = {};
  const query = qs.parse(querystring);

  if (query.list) {
    // URLs with a playlist can also have a video id so we need to check
    // for a playlist first.
    //  ie. https://www.youtube.com/watch?v=:videoId&list=:playlistId
    options.playlistId = query.list;
  } else if (query.v) {
    // Check if the video id was provided in the query string.
    //   ie. https://www.youtube.com/watch?v=:videoId
    options.videoId = query.v;
  } else {
    // Check for short urls, direct urls and embed urls.
    //    ie. https://youtu.be/:videoId
    //        https://www.youtube.com/v/:videoId
    //        https://www.youtube.com/embed/:videoId
    const shortVideo = new UrlPattern("(http(s)\\://)(www.)youtu.be/:videoId");
    const directVideo = new UrlPattern(
      "(http(s)\\://)(www.)youtube.com/v/:videoId"
    );
    const embedVideo = new UrlPattern(
      "(http(s)\\://)(www.)youtube.com/embed/:videoId"
    );

    let params = shortVideo.match(domain);
    if (params) options.videoId = params.videoId;

    params = directVideo.match(domain);
    if (params) options.videoId = params.videoId;

    params = embedVideo.match(domain);
    if (params) options.videoId = params.videoId;
  }

  // Check for start and end times for single videos.
  if (options.videoId) {
    // Start times can be set with &start= for embed urls or
    // &t= for short urls.
    if (query.start) {
      options.start = parseInt(query.start, 10);
    } else if (query.t) {
      options.start = parseInt(query.t, 10);
    }

    if (query.end) {
      options.end = parseInt(query.end, 10);
    }
  }

  return options;
}
