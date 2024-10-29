import type { RowMap } from "@fast-csv/parse";
import type { Query } from "./query-parser";

export function project(query: Query, row: RowMap): Partial<RowMap> {
  return query.projections.reduce((acc, column) => {
    if (column in row) {
      acc[column] = row[column];
    }
    return acc;
  }, {} as Partial<RowMap>);
}
