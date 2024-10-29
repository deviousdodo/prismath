import { expect, test } from "vitest";

import { parse } from "../query-parser";

test("parses query without filter", () => {
  const q = parse("PROJECT col1, col2");
  expect(q.projections).toStrictEqual(["col1", "col2"]);
});

test("allows columns with and without quotes", () => {
  const q = parse('PROJECT col1, "col2", "col3"');
  expect(q.projections).toStrictEqual(["col1", "col2", "col3"]);
});

test("columns with quotes allow white space, commas and =", () => {
  const q = parse('PROJECT col1, "example col, where = ok"');
  expect(q.projections).toStrictEqual(["col1", "example col, where = ok"]);
});

test("project keyword is required", () => {
  expect(() => parse("col1, col2")).toThrowError(/keyword/);
});

test("throws error if no columns given", () => {
  expect(() => parse("PROJECT")).toThrowError(/column/);
});

test("parses query with filter", () => {
  const q = parse("PROJECT col1 FILTER col1 = 10");
  expect(q.filters.length).toBe(1);
});

test("parses = filter", () => {
  const q = parse("PROJECT col1 FILTER col1 = 10");
  expect(q.filters[0]).toStrictEqual({
    column: "col1",
    operator: "=",
    value: 10,
  });
});

test("parses > filter", () => {
  const q = parse("PROJECT col1 FILTER col1 > 10");
  expect(q.filters[0]).toStrictEqual({
    column: "col1",
    operator: ">",
    value: 10,
  });
});

test("parses < filter", () => {
  const q = parse("PROJECT col1 FILTER col1 < 10");
  expect(q.filters[0]).toStrictEqual({
    column: "col1",
    operator: "<",
    value: 10,
  });
});

test("works with multiple AND filters", () => {
  const q = parse("PROJECT col1 FILTER col1 > 10 AND col2 < 100");
  expect(q.filters).toStrictEqual([
    {
      column: "col1",
      operator: ">",
      value: 10,
    },
    {
      column: "col2",
      operator: "<",
      value: 100,
    },
  ]);
});

test("parses filter with string value", () => {
  const q = parse('PROJECT col1 FILTER col1 > "a"');
  expect(q.filters[0]).toStrictEqual({
    column: "col1",
    operator: ">",
    value: "a",
  });
});

test("throws error if no filter given", () => {
  expect(() => parse("PROJECT col1 FILTER")).toThrowError(/condition/);
});

test("throws error when filter has no column", () => {
  expect(() => parse("PROJECT col1 FILTER = 3")).toThrowError(/column/);
});

test("throws error when filter has no operator", () => {
  expect(() => parse("PROJECT col1 FILTER col1 3")).toThrowError(/operator/);
});

test("throws error when filter has no value", () => {
  expect(() => parse("PROJECT col1 FILTER col1 =")).toThrowError(/value/);
});

test("throws error if multiple columns given without comma", () => {
  expect(() => parse("PROJECT col1 col2")).toThrowError(/unexpected/i);
});

test("throws error when query contains other characters", () => {
  expect(() => parse("PROJECT col1 FILTER col1 = 3 foo")).toThrowError(
    /unexpected/i,
  );
});
