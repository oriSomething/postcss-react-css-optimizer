/* eslint-env mocha */
import { assert } from "chai";
import ReactCSSAnalyzer from "../src/react-css-analyzer";


describe("ReactCSSAnalyzer", function() {
  describe("#_findClassNamesModule()", function() {
    it("ES2015 modules", function() {
      const analyzer = new ReactCSSAnalyzer(`
        import cx from "classnames";
      `);
      const result = analyzer._findClassNamesModule();

      assert.equal(result, "cx");
    });
  });

  describe("#_findClassNamesExpressions()", function() {
    it("should work with a single argument", function() {
      const analyzer = new ReactCSSAnalyzer(`
        import cx from "classnames";

        cx("hello");
      `);
      const args = analyzer._findClassNamesExpressions();

      assert.isArray(args);
      assert.lengthOf(args, 1);
      assert.equal(args[0].type, "Literal");
      assert.equal(args[0].value, "hello");
    });

    it("should work with multi arguments", function() {
      const analyzer = new ReactCSSAnalyzer(`
        import cx from "classnames";

        cx("hello", "world");
      `);
      const args = analyzer._findClassNamesExpressions();

      assert.isArray(args);
      assert.lengthOf(args, 2);
      assert.equal(args[0].value, "hello");
      assert.equal(args[1].value, "world");
    });
  });

  describe("#__extractCSSClassesFromClassNamesExpressions()", function() {
    it("should work for a single Literal", function() {
      const analyzer = new ReactCSSAnalyzer(`
        import cx from "classnames";

        cx("hello");
      `);
      const classNamesExpressions = analyzer._findClassNamesExpressions();
      const args = analyzer._extractCSSClassesFromClassNamesExpressions(classNamesExpressions);

      assert.deepEqual(args, ["hello"]);
    });

    it("should work for a multiple Literal", function() {
      const analyzer = new ReactCSSAnalyzer(`
        import cx from "classnames";

        cx("hello", "worlds");
      `);
      const classNamesExpressions = analyzer._findClassNamesExpressions();
      const args = analyzer._extractCSSClassesFromClassNamesExpressions(classNamesExpressions);

      assert.deepEqual(args, ["hello", "worlds"]);
    });

    it("should work for ObjectExpression", function() {
      const analyzer = new ReactCSSAnalyzer(`
        import cx from "classnames";

        cx({ "hello": true });
      `);
      const classNamesExpressions = analyzer._findClassNamesExpressions();
      const args = analyzer._extractCSSClassesFromClassNamesExpressions(classNamesExpressions);

      assert.deepEqual(args, ["hello"]);
    });
  });

  describe("#_findJSXClassNames()", function() {
    it("should work for className of String Litral", function() {
      const analyzer = new ReactCSSAnalyzer("<div className='someclass' />");
      const classNames = analyzer._findJSXClassNames();

      assert.deepEqual(classNames, ["someclass"]);
    });

    it("should work for className of String Litral in JSXExpressionContainer", function() {
      const analyzer = new ReactCSSAnalyzer("<div className={'someclass'} />");
      const classNames = analyzer._findJSXClassNames();

      assert.deepEqual(classNames, ["someclass"]);
    });

    it("should work for className of String Litral with whitespace", function() {
      const analyzer = new ReactCSSAnalyzer("<div className='someclass otherclass' />");
      const classNames = analyzer._findJSXClassNames();

      assert.deepEqual(classNames, ["someclass", "otherclass"]);
    });

    it("should work for nested JSX elments", function() {
      const analyzer = new ReactCSSAnalyzer(`
        <div className='someclass'>
          <div className='otherclass' />
        </div>
      `);
      const classNames = analyzer._findJSXClassNames();

      assert.deepEqual(classNames, ["someclass", "otherclass"]);
    });
  });

  describe("#getCSSClasses()", function() {
    it("should work", function() {
      const analyzer = new ReactCSSAnalyzer(`
        import cx from "classnames";

        export default (
          <div className={cx({ "hello": true })}>
            <div className="world" />
          </div>
        );
      `);
      const result = analyzer.getCSSClasses();

      assert.deepEqual(result, ["hello", "world"]);
    });
  });
});
