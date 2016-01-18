const glob = require("glob");
const _ = require("lodash");

/**
 * Glob defualt options.
 * Used for ignoring files in `node_modules` and `bower_components`
 * @const {Object}
 */
const GLOB_DEFAULT_OPTIONS = Object.freeze({
  ignore: Object.freeze([
    "bower_components/**",
    "node_modules/**"
  ])
});

/**
 * Returns Promise of filenames by receiving glob patterns
 * @param  {string[]} patterns - Files pattern, such as `*.js`
 * @param  {Object} globOptions - `glob` module options
 * @return {Promise.<string[]>} File names
 */
module.exports = function getFilesListByPatterns(patterns = [], globOptions = GLOB_DEFAULT_OPTIONS) {
  const filesListLists = patterns.map(pattern => new Promise((resolve, reject) => {
    glob(pattern, globOptions, (error, files) => {
      if (error) {
        reject(error);
      } else {
        resolve(files);
      }
    });
  }));

  return Promise.all(filesListLists)
    .then(filesList => {
      return _(filesList)
        .flatten()
        .uniq()
        .value();
    });
};
