import {AddProductInput} from '../../../domain/ports/AddProducts'

export function mergeAddProductInput(
  products: AddProductInput[],
): AddProductInput[] {
  const results = new Map<string, AddProductInput>()

  products.forEach(x => {
    const key = JSON.stringify({itemNo: x.itemNo, vendorId: x.vendorId})
    if (results.has(key)) {
      results.set(key, {...results.get(key), ...x})
    } else {
      results.set(key, x)
    }
  })

  return [...results.values()]
}
