/* eslint-env mocha */
import { assert } from "chai";
import postcss from "postcss";
import mockFS from "mock-fs";
import reactCSSOptimizer from "../src/postcss-plugin";


describe("PostCSSPlugin", function() {
  it("should remove all classes", async function() {
    const result = await postcss([reactCSSOptimizer])
      .process(".x {}", {})
      .then();
    const css = result.css.trim();

    assert.equal(css, "");
  });

  it("should remove all classes but whiteListClasses", async function() {
    const options = {
      whiteListClasses: ["x"]
    };
    const result = await postcss([reactCSSOptimizer(options)])
      .process(`
        .x {}
        .y {}
      `, {})
      .then();
    const css = result.css.replace(/\s/g, "");

    assert.equal(css, ".x{}");
  });

  it("shouldn't remove nested selectors: .x.x", async function() {
    const result = await postcss([reactCSSOptimizer])
      .process(".x.y {}", {})
      .then();
    const css = result.css.replace(/\s/g, "");

    assert.equal(css, ".x.y{}");
  });

  describe("parent child relation", function() {
    it("shouldn't remove: .x > .x", async function() {
      const result = await postcss([reactCSSOptimizer])
        .process(".x > .y {}", {})
        .then();
      const css = result.css.trim();

      assert.equal(css, ".x > .y {}");
    });

    it("shouldn't remove: .x > .x > .x", async function() {
      const result = await postcss([reactCSSOptimizer])
        .process(".x > .y > .z {}", {})
        .then();
      const css = result.css.trim();

      assert.equal(css, ".x > .y > .z {}");
    });

    it("shouldn't remove: .x .x", async function() {
      const result = await postcss([reactCSSOptimizer])
      .process(".x .y {}", {})
      .then();
      const css = result.css.trim();

      assert.equal(css, ".x .y {}");
    });
  });

  describe("or rules (.x, .y)", function() {
    it("should remove all", async function() {
      const result = await postcss([reactCSSOptimizer])
        .process(".x, .z {}", {})
        .then();
      const css = result.css.trim();

      assert.equal(css, "");
    });

    it("should remove all, and keep white list", async function() {
      const options = {
        whiteListClasses: ["z"]
      };
      const result = await postcss([reactCSSOptimizer(options)])
        .process(".x, .z {}", {})
        .then();
      const css = result.css.trim();

      assert.equal(css, ".z {}");
    });
  });

  describe("using files option", function() {
    afterEach(mockFS.restore);

    it("should find all classes from JSX", async function() {
      mockFS({
        "x.js": `<div className="x" />`
      });

      const options = {
        files: "x.js"
      };
      const result = await postcss([reactCSSOptimizer(options)])
        .process(".x, .z {}", {})
        .then();
      const css = result.css.trim();

      assert.equal(css, ".x {}");
    });
  });
});
