import {AddProducts} from '../domain/ports/AddProducts'
import {MSSQLProvider} from '../../../common/infrastructure/ports/MSSQLProvider'
import {mergeAddProductInputMSSQL} from './mergeAddProductInputMSSQL'
import {storeProductUPCMSSQL} from './storeProductUPCMSSQL/storeProductUPCMSSQL'

export function addProductsMSSQL({sql}: {sql: MSSQLProvider}): AddProducts {
  return async function({products}) {
    const t = sql.transaction()
    await t.begin()
    await mergeAddProductInputMSSQL(t, products)
    await storeProductUPCMSSQL(t, products)
    await t.commit()
  }
}
