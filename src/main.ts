import "dotenv/config";

import { parseFile } from "@fast-csv/parse";

import { parse } from "./query-parser";
import { match } from "./row-matcher";
import { project } from "./row-projection";
import { envOrExit } from "./util";

import type { Row } from "@fast-csv/parse";
const csvPath = envOrExit("CSV_FILE_PATH");
const query = envOrExit("QUERY");

const parsedQuery = parse(query);

let matched = 0;

parseFile(csvPath, { headers: true })
  .on("error", (error: Error) => console.error(error))
  .on("data", (row: Row) => {
    if (match(parsedQuery, row)) {
      matched++;
      console.table(project(parsedQuery, row));
    }
  })
  .on("end", (rowCount: number) =>
    console.log(`Matched ${matched} out of ${rowCount} rows.`),
  );
