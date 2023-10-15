export const isDevelopment = process.env.NODE_ENV === 'development';
export const addProtocolToUrl = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `http://${url}`;
};
export const illegalFilenameCharacters = /[\s"$()*/:;<>?[\\\]^|~]/g;
export const makeSafeTitle = (title: string) => {
  return title.replaceAll(illegalFilenameCharacters, '_');
};
