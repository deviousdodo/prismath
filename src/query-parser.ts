// Types to represent the query structure
export type FilterOperator = "=" | ">" | "<";

type FilterValue = string | number;

interface FilterCondition {
  column: string;
  operator: FilterOperator;
  value: FilterValue;
}

export interface Query {
  projections: string[];
  filters: FilterCondition[];
}

const WHITESPACE = /\s/;
const QUOTE = /"/;

export class QueryParser {
  private query: string;
  private currentPos: number = 0;

  constructor(query: string) {
    this.query = query.trim();
  }

  parse(): Query {
    const result: Query = {
      projections: [],
      filters: [],
    };

    // Parse projections
    if (!this.consumeKeyword("PROJECT")) {
      throw new Error("Query must start with PROJECT keyword.");
    }

    result.projections = this.parseProjections();
    if (result.projections.length === 0) {
      throw new Error("At least one column must be specified.");
    }

    // Parse filters
    if (this.consumeKeyword("FILTER")) {
      result.filters = this.parseFilters();
      if (result.filters.length === 0) {
        throw new Error("At least one condition must be specified.");
      }
    }

    if (this.currentPos < this.query.length) {
      throw new Error("Unexpected keywords found in query.");
    }

    return result;
  }

  private parseProjections(): string[] {
    this.skipWhitespace();

    const projections: string[] = [];

    while (this.currentPos < this.query.length) {
      // Check if we've reached the FILTER keyword
      if (this.query.slice(this.currentPos).startsWith("FILTER")) {
        break;
      }

      const column = this.parseColumnName();
      projections.push(column);

      this.skipWhitespace();
      if (
        this.currentPos < this.query.length &&
        this.query[this.currentPos] === ","
      ) {
        this.currentPos++; // Skip the comma
        continue;
      }
      break;
    }

    return projections;
  }

  private parseFilters(): FilterCondition[] {
    const filters: FilterCondition[] = [];

    while (this.currentPos < this.query.length) {
      const column = this.parseColumnName();
      const operator = this.parseOperator();
      const value = this.parseValue();

      filters.push({
        column,
        operator,
        value,
      });

      this.skipWhitespace();
      if (
        this.currentPos < this.query.length &&
        this.query.slice(this.currentPos).startsWith("AND")
      ) {
        this.currentPos += 3; // Skip 'AND'
        continue;
      }
      break;
    }

    return filters;
  }

  private parseColumnName(): string {
    this.skipWhitespace();

    let identifier = "";
    let endMarker = /\s|,|=/;
    if (this.query[this.currentPos] === '"') {
      this.currentPos++; // Skip opening quote
      endMarker = QUOTE;
    }

    while (this.currentPos < this.query.length) {
      const char = this.query[this.currentPos];
      if (endMarker.test(char)) {
        break;
      }
      identifier += char;
      this.currentPos++;
    }
    if (!identifier) {
      throw new Error(
        `Invalid filter column name at position ${this.currentPos}`,
      );
    }

    if (endMarker === QUOTE) {
      this.currentPos++; // Skip closing quote
    }

    this.skipWhitespace();

    return identifier;
  }

  private parseOperator(): FilterOperator {
    this.skipWhitespace();

    switch (this.query[this.currentPos]) {
      case "=":
      case ">":
      case "<":
        return this.query[this.currentPos++] as FilterOperator;
      default:
        throw new Error(
          `Invalid filter operator at position ${this.currentPos}`,
        );
    }
  }

  private parseValue(): FilterValue {
    this.skipWhitespace();

    if (this.currentPos >= this.query.length) {
      throw new Error(`Missing filter value at position ${this.currentPos}`);
    }

    let endValueChar = WHITESPACE;
    if (this.query[this.currentPos] === '"') {
      this.currentPos++; // Skip opening quote
      endValueChar = /"/;
    }

    let value: FilterValue = "";

    while (
      this.currentPos < this.query.length &&
      !endValueChar.test(this.query[this.currentPos])
    ) {
      value += this.query[this.currentPos];
      this.currentPos++;
    }

    if (endValueChar === WHITESPACE) {
      value = parseInt(value);
    } else {
      if (this.currentPos >= this.query.length) {
        throw new Error("Unterminated string value");
      }

      this.currentPos++; // Skip closing quote
    }

    return value;
  }

  private consumeKeyword(keyword: string): boolean {
    this.skipWhitespace();

    if (this.query.slice(this.currentPos).startsWith(keyword)) {
      this.currentPos += keyword.length;
      return true;
    }

    return false;
  }

  private skipWhitespace(): void {
    while (
      this.currentPos < this.query.length &&
      WHITESPACE.test(this.query[this.currentPos])
    ) {
      this.currentPos++;
    }
  }
}

export function parse(query: string): Query {
  const q = new QueryParser(query);
  return q.parse();
}
