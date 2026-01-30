const parseLinkHeader = require('../../src/utils/parseLinkHeader');

describe('parseLinkHeader', () => {
  it('should parse a valid Link header', () => {
    const linkHeader =
      '<https://example.com/api/v1/courses?page=2>; rel="next", ' +
      '<https://example.com/api/v1/courses?page=1>; rel="prev", ' +
      '<https://example.com/api/v1/courses?page=1>; rel="first", ' +
      '<https://example.com/api/v1/courses?page=5>; rel="last"';

    const result = parseLinkHeader(linkHeader);

    expect(result).toEqual({
      next: 'https://example.com/api/v1/courses?page=2',
      prev: 'https://example.com/api/v1/courses?page=1',
      first: 'https://example.com/api/v1/courses?page=1',
      last: 'https://example.com/api/v1/courses?page=5',
    });
  });

  it('should handle missing Link header', () => {
    const result = parseLinkHeader(null);
    expect(result).toEqual({});
  });

  it('should handle undefined Link header', () => {
    const result = parseLinkHeader(undefined);
    expect(result).toEqual({});
  });

  it('should handle empty string', () => {
    const result = parseLinkHeader('');
    expect(result).toEqual({});
  });

  it('should handle Link header with only next', () => {
    const linkHeader = '<https://example.com/api/v1/courses?page=2>; rel="next"';
    const result = parseLinkHeader(linkHeader);

    expect(result).toEqual({
      next: 'https://example.com/api/v1/courses?page=2',
    });
  });
});
