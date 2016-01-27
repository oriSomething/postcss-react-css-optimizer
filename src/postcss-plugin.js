const fs = require("fs");
const postcss = require("postcss");
const selectorParser = require("postcss-selector-parser");
const _ = require("lodash");
const getFilesListByPatterns = require("./utilities/get-files-list-by-patterns");
const ReactCSSAnalyzer = require("./react-css-analyzer");
const SU = require("./selectors-utilities");


/**
 * @typedef {Object} Options
 * @property {string[]} whiteListClasses
 * @property {string[]} files
 */

/**
 * The actual transform functions that removes CSS classes / rules
 * @private
 * @param  {string[]} whiteListClasses
 * @param  {Rule}     rule
 */
function createTransform(whiteListClasses, rule) {
  return function(selectors) {
    const selectorsLength = selectors.length;

    selectors.each(selector => {
      if (SU.isSupported(selector) && SU.canOmit(selector, whiteListClasses)) {
        selector.removeSelf();
      }

      // Do nothing with unsupported rules
    });

    if (selectors.length === 0) {
      rule.remove();
    } else if (selectorsLength !== selectors.length) {
      rule.selector = selectors.toString();
    }
  };
}

/**
 * Extract CSS classes from files using JSX / classNames module
 * @param  {string[]} files File names
 * @return {Promise.<string[]>} White list of CSS classes
 */
function getCSSClassesFromFiles(files) {
  const filesDataPromises = files.map(file => new Promise((resolve, reject) => {
    fs.readFile(file, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  }));

  return Promise.all(filesDataPromises).then(filesData => {
    return _(filesData)
      .map(fileData => new ReactCSSAnalyzer(fileData).getCSSClasses())
      .flatten()
      .value();
  });
}

/**
 * The PostCSS plugin to remove uneeded CSS class by React components
 * TODO: check for sort white list classses for performance
 * @param  {Options} options
 * @return {Object} CSSPlugin
 */
module.exports = postcss.plugin("reactCSSOptimizer", function(options) {
  options = options || {};

  /** @const {string[]} whiteListClasses */
  const whiteListClasses = options.whiteListClasses || [];
  /** @const {(string|string[])} files */
  let files = options.files || [];
  files = _.isString(files) ? [files] : files;

  return (css) => {
    return getFilesListByPatterns(files || [])
      .then(getCSSClassesFromFiles)
      .then(filesWhiteListClasses => {
        css.walkRules((rule) => {
          const combinedWhiteListClasses = _(filesWhiteListClasses)
            .concat(whiteListClasses)
            .uniq()
            .value();

          const transform = createTransform(combinedWhiteListClasses, rule);
          selectorParser(transform).process(rule.selector);
        });
      });
  };
});
