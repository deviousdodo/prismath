import { expect, test } from "vitest";

import { match } from "../row-matcher";

import type { Row } from "@fast-csv/parse";
import type { Query } from "../query-parser";

const row: Row = {
  col1: "abc",
  num1: 10,
};

function q(filters: Query["filters"]): Query {
  return {
    projections: ["col1"],
    filters,
  };
}

type FilterOutcomes = [Query, boolean, string][];

function expectFilters(filterOutcomes: FilterOutcomes) {
  filterOutcomes.forEach(([q, expected, msg]) => {
    const result = match(q, row);
    expect(result, msg).toBe(expected);
  });
}

test("row without filters always matches", () => {
  const result = match(q([]), row);
  expect(result).toBe(true);
});

test("filter = works correctly", () => {
  expectFilters([
    [q([{ column: "col1", operator: "=", value: "abc" }]), true, "col1 = abc"],
    [q([{ column: "col1", operator: "=", value: "abb" }]), false, "col1 = abb"],
    [q([{ column: "num1", operator: "=", value: 10 }]), true, "num1 = 10"],
    [q([{ column: "num1", operator: "=", value: 100 }]), false, "num1 = 100"],
  ]);
});

test("filter > works correctly", () => {
  expectFilters([
    [q([{ column: "col1", operator: ">", value: "abb" }]), true, "col1 > abb"],
    [q([{ column: "col1", operator: ">", value: "abc" }]), false, "col1 > abc"],
    [q([{ column: "num1", operator: ">", value: 9 }]), true, "num1 > 9"],
    [q([{ column: "num1", operator: ">", value: 10 }]), false, "num1 > 10"],
  ]);
});

test("filter < works correctly", () => {
  expectFilters([
    [q([{ column: "col1", operator: "<", value: "abd" }]), true, "col1 < abd"],
    [q([{ column: "col1", operator: "<", value: "abc" }]), false, "col1 < abc"],
    [q([{ column: "num1", operator: "<", value: 11 }]), true, "num1 < 11"],
    [q([{ column: "num1", operator: "<", value: 10 }]), false, "num1 < 10"],
  ]);
});

test("multiple filters work correctly", () => {
  const result = match(
    q([
      { column: "col1", operator: "<", value: "abd" },
      { column: "num1", operator: ">", value: 9 },
    ]),
    row,
  );
  expect(result).toBe(true);
  expectFilters([
    [
      q([
        { column: "col1", operator: "<", value: "abd" },
        { column: "num1", operator: "<", value: 11 },
      ]),
      true,
      "col1 < abd AND num1 < 11",
    ],
    [
      q([
        { column: "col1", operator: "<", value: "abc" },
        { column: "num1", operator: "<", value: 10 },
      ]),
      false,
      "col1 < abc AND num1 < 10",
    ],
    [
      q([
        { column: "num1", operator: "<", value: 11 },
        { column: "num1", operator: "<", value: 10 },
      ]),
      false,
      "num1 < 11 AND num1 < 10",
    ],
    [
      q([
        { column: "num1", operator: "<", value: 10 },
        { column: "col1", operator: "<", value: "abc" },
      ]),
      false,
      "num1 < 10 AND col1 < abc",
    ],
  ]);
});
