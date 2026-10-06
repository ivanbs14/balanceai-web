export function todayCivilDate(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function civilDateFromApi(value: string): string {
  const date = value.slice(0, 10);
  return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date)
    ? date
    : value;
}

export function formatCivilDatePtBr(value: string): string {
  const date = civilDateFromApi(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return value;
  return `${date.slice(8, 10)}/${date.slice(5, 7)}/${date.slice(0, 4)}`;
}
