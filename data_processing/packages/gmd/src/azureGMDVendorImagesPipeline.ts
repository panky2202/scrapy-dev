import {AzureFunction, Context} from "@azure/functions";
import {blobStorageProviderAzure} from "./common/infrastructure/blobStorageProviderAzure";
import {GlobalConfig} from "./common/application/globalConfig";
import {findVendorMSSQL} from "./features/vendor-images-pipeline/infrastructure/findVendorMSSQL/findVendorMSSQL";
import {mssqlProviderNode} from "./common/infrastructure/mssqlProviderNode";
import {ProductImageBuffer} from "./features/missing-products/domain/value-objects/ProductImageBuffer/ProductImageBufferSchema";
import {NonEmptyString} from "./common/domain/value-objects";
import {
  FeatureInputSchema,
  vendorImagePipeline
} from "./features/vendor-images-pipeline/application/vendorImagesPipelineFeature";

const sql = mssqlProviderNode({
  user: GlobalConfig.SQL.userName,
  password: GlobalConfig.SQL.password,
  server: GlobalConfig.SQL.server ?? '',
  port: GlobalConfig.SQL.port,
  database: GlobalConfig.SQL.database,
});

const blob = blobStorageProviderAzure({
  connectionString: GlobalConfig.AZURE_STORAGE.connectionString,
});

const imagesContainer = blob.container("images");

const storeImageFunction = async function (
  imageName: NonEmptyString,
  productImageBuffer: ProductImageBuffer
): Promise<NonEmptyString> {
  const results = await imagesContainer.storeBuffer(imageName, await productImageBuffer)
  return results["url"]
}

const feature = vendorImagePipeline(
  findVendorMSSQL({sql: sql}),
  storeImageFunction,
  console.log
)

export const azureGMDVendorImagesPipeline: AzureFunction = async function (
  context: Context
): Promise<void> {
  await feature(
    FeatureInputSchema({
        imageSource: context.bindingData.blobTrigger,
        itemNumber: context.bindingData.itemNumber,
        vendorDisplayName: context.bindingData.vendorDisplayName,
        productImage: context.bindings.blob,
        extension: context.bindingData.extension,
      } as any
    ));
}
