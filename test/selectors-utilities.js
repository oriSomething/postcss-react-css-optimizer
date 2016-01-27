/* eslint-env mocha */
import { assert } from "chai";
import selectorParser from "postcss-selector-parser";
import SU from "../src/selectors-utilities";


function createSelectorTest(selector, callback) {
  return () => selectorParser(callback).process(selector);
}

describe("SelectorsUtilities", function() {
  describe("isSupported()", function() {
    describe("supported selectors", function() {
      it("should return true for `.class` selector", createSelectorTest(".a", (rootSelector) => {
        assert.lengthOf(rootSelector, 1, "number of selector");
        const result = rootSelector.every(SU.isSupported);
        assert.ok(result, "result should be true");
      }));

      it("should return true for `.class.class` selector", createSelectorTest(".a.b", (rootSelector) => {
        assert.lengthOf(rootSelector, 1, "number of selector");
        const result = rootSelector.every(SU.isSupported);
        assert.ok(result, "result should be true");
      }));

      it("should return true for `.class .class` selector", createSelectorTest(".a .b", (rootSelector) => {
        assert.lengthOf(rootSelector, 1, "number of selector");
        const result = rootSelector.every(SU.isSupported);
        assert.ok(result, "result should be true");
      }));

      it("should return true for `.class > .class` selector", createSelectorTest(".a > .b", (rootSelector) => {
        assert.lengthOf(rootSelector, 1, "number of selector");
        const result = rootSelector.every(SU.isSupported);
        assert.ok(result, "result should be true");
      }));

      it("should return true for `.class + .class` selector", createSelectorTest(".a + .b", (rootSelector) => {
        assert.lengthOf(rootSelector, 1, "number of selector");
        const result = rootSelector.every(SU.isSupported);
        assert.ok(result, "result should be true");
      }));

      it("should return true for `.class ~ .class` selector", createSelectorTest(".a ~ .b", (rootSelector) => {
        assert.lengthOf(rootSelector, 1, "number of selector");
        const result = rootSelector.every(SU.isSupported);
        assert.ok(result, "result should be true");
      }));
    });

    describe("not (yet) supported selectors", function() {
      it("should return false for `attribute`", createSelectorTest("href", (rootSelector) => {
        assert.lengthOf(rootSelector, 1, "number of selector");
        const result = rootSelector.every(SU.isSupported);
        assert.notOk(result, "result should be false");
      }));

      it("should return false for `attribute` with value", createSelectorTest("[href='http://com.com']", (rootSelector) => {
        assert.lengthOf(rootSelector, 1, "number of selector");
        const result = rootSelector.every(SU.isSupported);
        assert.notOk(result, "result should be false");
      }));

      it("should return false for `id`", createSelectorTest("#id", (rootSelector) => {
        assert.lengthOf(rootSelector, 1, "number of selector");
        const result = rootSelector.every(SU.isSupported);
        assert.notOk(result, "result should be false");
      }));

      it("should return false for `comment`", createSelectorTest("/* comment */", (rootSelector) => {
        assert.lengthOf(rootSelector, 1, "number of selector");
        const result = rootSelector.every(SU.isSupported);
        assert.notOk(result, "result should be false");
      }));

      it("should return false for empty", createSelectorTest("", (rootSelector) => {
        assert.lengthOf(rootSelector, 1, "number of selector");
        const result = rootSelector.every(SU.isSupported);
        assert.notOk(result, "result should be false");
      }));

      it("should return false for empty pseudo", createSelectorTest(":hover", (rootSelector) => {
        assert.lengthOf(rootSelector, 1, "number of selector");
        const result = rootSelector.every(SU.isSupported);
        assert.notOk(result, "result should be false");
      }));

      it("should return false for class with pseudo", createSelectorTest(".x:hover", (rootSelector) => {
        assert.lengthOf(rootSelector, 1, "number of selector");
        const result = rootSelector.every(SU.isSupported);
        assert.notOk(result, "result should be false");
      }));

      it("should return false for combinator followed empty selector", createSelectorTest("> .x", (rootSelector) => {
        assert.lengthOf(rootSelector, 1, "number of selector");
        const result = rootSelector.every(SU.isSupported);
        assert.notOk(result, "result should be false");
      }));

      it("should return false for empty selector followed combinator", createSelectorTest(".x >", (rootSelector) => {
        assert.lengthOf(rootSelector, 1, "number of selector");
        const result = rootSelector.every(SU.isSupported);
        assert.notOk(result, "result should be false");
      }));
    });
  });

  describe("canOmit()", function() {
    it("should work for `.x`", createSelectorTest(".a", (rootSelector) => {
      assert.lengthOf(rootSelector, 1, "number of selector");

      const firstSelector = rootSelector.first;

      const falsy  = SU.canOmit(firstSelector, ["a"]);
      assert.notOk(falsy, ".a shouldn't be omitted");

      const truthy = SU.canOmit(firstSelector, []);
      assert.ok(truthy, ".a should be omitted");
    }));

    it("should work for `.x.y`", createSelectorTest(".a.b", (rootSelector) => {
      assert.lengthOf(rootSelector, 1, "number of selector");

      const firstSelector = rootSelector.first;

      assert.notOk(SU.canOmit(firstSelector, ["a", "b"]), ".a or .b shouldn't be omitted");
      assert.ok(SU.canOmit(firstSelector, ["a"]), ".a and .b should be omitted");
      assert.ok(SU.canOmit(firstSelector, ["b"]), ".a and .b should be omitted");
      assert.ok(SU.canOmit(firstSelector, []), ".a and .b should be omitted");
    }));

    it("should work for `.x .y`", createSelectorTest(".a .b", (rootSelector) => {
      assert.lengthOf(rootSelector, 1, "number of selector");

      const firstSelector = rootSelector.first;

      assert.notOk(SU.canOmit(firstSelector, ["a", "b"]), ".a or .b shouldn't be omitted");
      assert.ok(SU.canOmit(firstSelector, ["a"]), ".a and .b should be omitted");
      assert.ok(SU.canOmit(firstSelector, ["b"]), ".a and .b should be omitted");
      assert.ok(SU.canOmit(firstSelector, []), ".a and .b should be omitted");
    }));

    it("should work for `.x > .y`", createSelectorTest(".a > .b", (rootSelector) => {
      assert.lengthOf(rootSelector, 1, "number of selector");

      const firstSelector = rootSelector.first;

      assert.notOk(SU.canOmit(firstSelector, ["a", "b"]), ".a or .b shouldn't be omitted");
      assert.ok(SU.canOmit(firstSelector, ["a"]), ".a and .b should be omitted");
      assert.ok(SU.canOmit(firstSelector, ["b"]), ".a and .b should be omitted");
      assert.ok(SU.canOmit(firstSelector, []), ".a and .b should be omitted");
    }));

    it("should work for `.x + .y`", createSelectorTest(".a + .b", (rootSelector) => {
      assert.lengthOf(rootSelector, 1, "number of selector");

      const firstSelector = rootSelector.first;

      assert.notOk(SU.canOmit(firstSelector, ["a", "b"]), ".a or .b shouldn't be omitted");
      assert.ok(SU.canOmit(firstSelector, ["a"]), ".a and .b should be omitted");
      assert.ok(SU.canOmit(firstSelector, ["b"]), ".a and .b should be omitted");
      assert.ok(SU.canOmit(firstSelector, []), ".a and .b should be omitted");
    }));

    it("should work for `.x ~ .y`", createSelectorTest(".a ~ .b", (rootSelector) => {
      assert.lengthOf(rootSelector, 1, "number of selector");

      const firstSelector = rootSelector.first;

      assert.notOk(SU.canOmit(firstSelector, ["a", "b"]), ".a or .b shouldn't be omitted");
      assert.ok(SU.canOmit(firstSelector, ["a"]), ".a and .b should be omitted");
      assert.ok(SU.canOmit(firstSelector, ["b"]), ".a and .b should be omitted");
      assert.ok(SU.canOmit(firstSelector, []), ".a and .b should be omitted");
    }));
  });
});
