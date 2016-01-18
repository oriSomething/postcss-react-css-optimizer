const jscodeshift = require("jscodeshift");
const _ = require("lodash");


module.exports = class ReactCSSAnalyzer {
  /** @property {Object} ast */
  /** @property {string} classNamesModuleVariable */
  /** @property {string} code */
  /** @property {string[]} cssClasses */

  constructor(code = "") {
    this.code	= code;
    this.ast = jscodeshift(code);
    this.classNamesModuleVariable = this._findClassNamesModule();

    const cxClassNames = this._extractCSSClassesFromClassNamesExpressions(
      this._findClassNamesExpressions()
    );
    const classNames = this._findJSXClassNames();
    this.cssClasses = _.uniq([...cxClassNames, ...classNames]);

    Object.seal(this);
  }

  getCSSClasses() {
    return this.cssClasses;
  }

  /**
   * Returns the name of the variable decleration of the `classnames` module
   * @todo CommonJS support
   * @private
   * @method _findClassNamesModule
   * @return {string}
   */
  _findClassNamesModule() {
    const MODULE_CLASSNAMES_NAME = "classnames";
    const paths = this.ast.find(jscodeshift.ImportDeclaration)
      .filter((node) => node.value.source.value === MODULE_CLASSNAMES_NAME)
      .paths();

    if (paths != null && paths.length === 0) {
      return "";
    } else {
      return paths[0].value.specifiers[0].local.name;
    }
  }

  /**
   * Return arguments of classNames module calls
   * @private
   * @method _findClassNamesExpressions
   * @return {Object[]} arguments AST of arguments of classNames
   */
  _findClassNamesExpressions() {
    const classNamesModuleVariable = this.classNamesModuleVariable;

    if (!classNamesModuleVariable) {
      return [];
    }

    const paths = this.ast.find(jscodeshift.CallExpression)
      .filter((node) => node.value.callee.name === classNamesModuleVariable)
      .paths();

    return _.get(paths, "[0].value.arguments") || [];
  }

  /**
   * Returns literals of _findClassNamesExpressions results
   * @private
   * @method _extractCSSClassesFromClassNamesExpressions
   * @param  {Object[]} expressions AST of arguments
   * @return {string[]}
   */
  _extractCSSClassesFromClassNamesExpressions(expressions) {
    const handleExpressions = (node) => {
      switch(node.type) {
      case "Literal":
        return node.value;
      case "ObjectExpression":
        return _.chain(node.properties)
          .filter(node => node.key.type === "Literal")
          .map(node => node.key.value)
          .value();
      }

      return "";
    };

    return _(expressions)
      .map(handleExpressions)
      .flatten()
      .value();
  }

  /**
   * Returns CSS classes from JSX element's className attribute
   * @todo CommonJS support
   * @private
   * @method _findClassNamesModule
   * @return {string[]}
   */
  _findJSXClassNames() {
    const paths = this.ast.find(jscodeshift.JSXAttribute)
      .filter((node) => node.value.name.name === "className")
      .paths();

    return _(paths)
      // Gets the value of the attribute
      .map((node) => node.value.value)
      .map((value) => {
        switch(value.type) {
        case "Literal":
          return value.value;
        case "JSXExpressionContainer":
          if (value.expression.type === "Literal") {
            return value.expression.value;
          }
        }

        // Returns empty string for unknown
        return "";
      })
      // Split multi classNames in a single string
      // example: "x y" => ["x", "y"]
      .map((className) => className.split(/\s/g))
      .flatten()
      // Remove empty classNames
      .filter()
      .value();
  }
};
