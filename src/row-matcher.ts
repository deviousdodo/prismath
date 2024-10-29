import type { Row } from "@fast-csv/parse";
import type { Query } from "./query-parser";

export function match(query: Query, row: Row): boolean {
  return query.filters.every((filter) => {
    if (!(filter.column in row)) {
      // ignore rows that don't have the column. this is a product decision
      // and could be changed or even exposed as a configuration option.
      return false;
    }

    const value = row[filter.column as keyof Row];

    // freely using type coercion :)
    switch (filter.operator) {
      case "=":
        return value === filter.value;
      case ">":
        return value > filter.value;
      case "<":
        return value < filter.value;
      default:
        throw new Error(`Unknown operator: ${filter.operator}`);
    }
  });
}
