/**
 * Parse Canvas API Link header for pagination
 * @param {String} linkHeader - Link header from Canvas API response
 * @returns {Object} Parsed links object with next, prev, first, last URLs
 */
const parseLinkHeader = (linkHeader) => {
  if (!linkHeader) {
    return {};
  }

  const links = {};
  const parts = linkHeader.split(',');

  parts.forEach((part) => {
    const section = part.split(';');
    if (section.length !== 2) {
      return;
    }

    const url = section[0].replace(/<(.*)>/, '$1').trim();
    const name = section[1].replace(/rel="(.*)"/, '$1').trim();

    links[name] = url;
  });

  return links;
};

module.exports = parseLinkHeader;
