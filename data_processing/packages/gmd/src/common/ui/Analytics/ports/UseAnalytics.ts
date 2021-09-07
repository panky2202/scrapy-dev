export type Analytics = {
  exceptionEvent: (description?: string) => any
  searchEvent: (searchTerm?: string) => any
  barcodeScanEvent: (success: boolean, barcode?: string) => any
}
