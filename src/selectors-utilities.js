const _ = require("lodash");


/**
 * Test if selector supported for
 * @param  {Selector} selector
 * @return {boolean}
 */
exports.isSupported = function(selector) {
  const length = selector.length;

  return length > 0 && selector.every((selector, index) => {
    if (index === 0 || index === (length - 1)) {
      return selector.type === "class";
    }

    return (
      selector.type === "class" ||
      selector.type === "combinator"
    );
  });
};

/**
 * Test if selector needed or can be removed later. assumed selector of
 * supported type.
 * List of supported selectors:
 * - .E
 * - .E .F
 * - .E > .F
 * - .E + .F
 * - .E ~ .F
 *
 * @param  {Selector} selector
 * @param  {string[]} whiteListClasses List of needed classes
 * @return {boolean}
 */
exports.canOmit = function(selector, whiteListClasses = []) {
  return selector.some(selector => {
    return (
      selector.type === "class" &&
      // NOTE: `!`
      !_.includes(whiteListClasses, selector.value)
    );
  });
};
