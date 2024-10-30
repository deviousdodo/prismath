# prismath

## How to run

```
npm install
cp .env.sample .env
npm run test # make sure everything is ok.
npm run execute
# edit .env file & re-run execute as needed.
```

## Questions

- What were some of the tradeoffs you made when building this and why were these acceptable tradeoffs?
  - created a simple / scrapy parser. for the simple use-case it was good enough and it provides a low barrier of entry for anyone who would like to change the code.
  - not writing enough tests.
  - made some assumptions for the CSV files (that they have headers, standard separator), as I felt it was good enough for the test.
- Given more time, what improvements or optimizations would you want to add? When would you add them?
  - rewrite parser (most likely when complex filters are needed).
  - add a nice cli interface (when the project is consistently used and more options are added).
- What changes are needed to accommodate changes to support other data types, multiple filters, or ordering of results?
  - change the parser to recognize these additional features; especially for complex filters (precedence, nested conditions) a parser with an AST would be helpful.
- What changes are needed to process extremely large datasets
  - at the moment processing is streamed so memory shouldn't be an issue (at least without sorting). we can add indexing, caching and parallel (chunk) processing.
- What do you still need to do to make this code production ready?
  - it depends on product requirements. what seems off at the moment: filtering is loosely defined (with type coercion), missing columns are ignored (in both selection and filtering), there aren't enough tests. if more complex filters are needed most likely the parser should be rewritten.

### Resources

Sample csv file was taken from: https://github.com/datablist/sample-csv-files
