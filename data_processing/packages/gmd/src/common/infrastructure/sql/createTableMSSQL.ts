export function createTableMSSQL(
  name: string,
  shape: string,
  {
    columns,
    values,
  }: {
    columns: string
    values: string[]
  },
) {
  const valuesStr = values.map((x) => `(${x})`).join(',')
  return `
    CREATE TABLE ${name} (${shape});
    INSERT INTO ${name} (${columns}) VALUES ${valuesStr};
  `
}
