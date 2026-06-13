export function getServerEnv(name: string): string {
  const value = process.env[name];
  if (!value || value === '""' || value === "''") return '';
  return value;
}

export function hasServerEnv(name: string): boolean {
  return Boolean(getServerEnv(name));
}
