export function envOrExit(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} env var is not set`);
    process.exit(1);
  }
  return value;
}
