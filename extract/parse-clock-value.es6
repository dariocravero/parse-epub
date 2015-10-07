const HOURS = 'h';
const MINUTES = 'min';
const MILLISECONDS = 'ms';
const SECONDS = 's';
const TIME_SEPARATOR = ':';

// https://github.com/dariocravero/readium-js/blob/master/src/epub/smil-document-parser.js#L213-L243
// parse the timestamp and return the value in seconds
// supports this syntax:
// http://idpf.org/epub/30/spec/epub30-mediaoverlays.html#app-clock-examples
export default function parseClockValue(value) {
  if (!value) return 0;

  let hours = 0;
  let mins = 0;
  let secs = 0;

  const index = {
    hours: value.indexOf(HOURS),
    mins: value.indexOf(MINUTES),
    ms: value.indexOf(MILLISECONDS),
    secs: value.indexOf(SECONDS)
  };

  if (index.mins !== -1) {
    mins = parseFloat(value.substr(0, index.mins), 10);
  } else if (index.ms !== -1) {
    let ms = parseFloat(value.substr(0, index.ms), 10);
    secs = ms / 1000;
  } else if (index.secs !== -1) {
    secs = parseFloat(value.substr(0, index.secs), 10);
  } else if (index.hours !== -1) {
    hours = parseFloat(value.substr(0, index.hours), 10);
  } else {
    // parse as hh:mm:ss.fraction
    // this also works for seconds-only, e.g. 12.345
    let arr = value.split(TIME_SEPARATOR);
    secs = parseFloat(arr.pop(), 10);
    if (arr.length > 0) {
      mins = parseFloat(arr.pop(), 10);
      if (arr.length > 0) {
        hours = parseFloat(arr.pop(), 10);
      }
    }
  }

  return hours * 3600 + mins * 60 + secs;
}
