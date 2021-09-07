export function createTableOfStructureMSSQL(
  name: string,
  sourceTable: string,
  {
    columns,
    values,
    identityInsert = false,
  }: {
    columns: string
    values: string[]
    identityInsert?: boolean
  },
) {
  const valuesStr = values.map((x) => `(${x})`).join(',')
  const insertStr = valuesStr
    ? `INSERT INTO ${name} (${columns}) VALUES ${valuesStr};`
    : ''
  const insertStr_ =
    identityInsert && insertStr
      ? `
        SET IDENTITY_INSERT ${name} ON;
        ${insertStr}
        SET IDENTITY_INSERT ${name} OFF;
     `
      : insertStr

  return `
    SELECT TOP 0 * INTO ${name} FROM ${sourceTable};
    ${insertStr_}
  `
}
