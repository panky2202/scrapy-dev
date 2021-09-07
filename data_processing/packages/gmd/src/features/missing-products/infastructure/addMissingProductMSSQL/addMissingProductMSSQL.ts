import {SQLRequestSource} from '../../../../common/infrastructure/ports/MSSQLProvider'
import {AddMissingProductResolvedImages} from '../../application/addMissingProduct/ports/AddMissingProductResolvedImages'

export function addMissingProductMSSQL({
  sql,
}: {
  sql: SQLRequestSource
}): AddMissingProductResolvedImages {
  return async function (product) {
    const {upc, comment, email, photoUpc, photoFront, photoBack} = product

    await sql
      .request()
      .input('upc', upc)
      .input('comments', comment ?? '')
      .input('photoUPC', photoUpc ?? '')
      .input('photoBack', photoBack)
      .input('photoFront', photoFront)
      .input('email', email)
      .input('status', '').query(`
            INSERT INTO MissingProducts (UPC, PhotoFront, PhotoBack, PhotoUPC, Comments, Email, Status)
            VALUES(@upc, @photoFront, @photoBack, @photoUPC, @comments, @email, @status)
            `)
  }
}
