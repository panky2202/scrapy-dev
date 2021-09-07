import {FeatureInputSchema, findVendorId, storeImages, vendorImagePipeline} from "./vendorImagesPipelineFeature";
import {expect} from "@jest/globals";
import {VendorInputSchema} from "../domain/ports/FindVendor";

describe('Test vendor Images pipeline feature', () => {
    test('Test storeImages is called with the correct name', () => {
      const storeImagesFunctionMock = jest.fn()
      const bufferMock = jest.fn()
      let itemNumber = "11";
      let vendorId = "1134";
      const imageInput = {
        itemNumber: itemNumber,
        vendorId: vendorId,
        productImage: bufferMock,
      }

      storeImages(storeImagesFunctionMock, imageInput)

      expect(storeImagesFunctionMock).toBeCalledWith(`${vendorId}_${itemNumber}`, bufferMock)
    });

    test("Test function findVendorId returns undefined when vendor is not found", async () => {
      const findVendorFunctionMock = jest.fn()
      const vendorInput = VendorInputSchema({displayName: "displayName"})
      findVendorFunctionMock.mockReturnValue([])

      expect(await findVendorId(findVendorFunctionMock, vendorInput)).toBeUndefined()
    })

    test("Test should return skip when extension is not supported", async () => {
      const findVendorFunctionMock = jest.fn()
      const storeImageFunctionMock = jest.fn()
      const logMock = jest.fn()
      const pipeline = vendorImagePipeline(findVendorFunctionMock, storeImageFunctionMock, logMock)

      await pipeline(
        FeatureInputSchema({
          imageSource: "test",
          vendorDisplayName: "test",
          extension: "test",
          itemNumber: "test",
          productImage: "test"
        }))

      expect(logMock).toBeCalledWith(">>> Pipeline exit because image has unsupported extension")
    })

    test("Test should skip if vendor is not found", async () => {
      const findVendorFunctionMock = jest.fn()
      findVendorFunctionMock.mockReturnValue([])
      const storeImageFunctionMock = jest.fn()
      const logMock = jest.fn()
      const pipeline = vendorImagePipeline(findVendorFunctionMock, storeImageFunctionMock, logMock)

      await pipeline(
        FeatureInputSchema({
          imageSource: "test",
          vendorDisplayName: "test",
          extension: "jpg",
          itemNumber: "test",
          productImage: "test"
        }))

      expect(logMock).toBeCalledWith(">>> Error Vendor", "test", "not found.")
    })

    test("Test should call functions with correct params", async () => {
      const findVendorFunctionMock = jest.fn()
      findVendorFunctionMock.mockReturnValue([{id: 11}])
      const storeImageFunctionMock = jest.fn()
      const logMock = jest.fn()
      const pipeline = vendorImagePipeline(findVendorFunctionMock, storeImageFunctionMock, logMock)

      await pipeline(
        FeatureInputSchema({
          imageSource: "triggeredImage",
          vendorDisplayName: "displayName",
          extension: "jpg",
          itemNumber: "ITEM_NUMBER",
          productImage: "test"
        }))

      expect(findVendorFunctionMock).toBeCalled()
      expect(logMock).toBeCalledWith(">>> Vendor", 11, "found")
      expect(storeImageFunctionMock).toBeCalled()
    })
  }
);

