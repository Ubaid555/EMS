import mongoose from "mongoose";
import { str, num, ref, versioningHeader } from "../../utils/mongoose.js";

/**
 * =========================================================================
 * Parent Asset Model (Family Module - Multi-Entity SCD Type 2)
 * =========================================================================
 * Property, real estate, vehicles, or financial assets declared for a specific parent.
 */
const parentAssetSchema = new mongoose.Schema(
  {
    parentId: ref("Parent", true, { index: true }),

    assetType: str(true, { uppercase: true, index: true }), // Lookup: ASSET_TYPE
    title: str(true), // e.g. "Residential Plot 1 Kanal, DHA"
    estimatedValue: num(0, false), // Numeric value
    location: str(false),
    ownershipSharePercentage: num(100, false),
    notes: str(false, { default: "" }),

    ...versioningHeader("ParentAsset"),
  },
  {
    timestamps: true,
  }
);

parentAssetSchema.index(
  { employeeId: 1, parentId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);
parentAssetSchema.index({ rootRecordId: 1, version: -1 });

const ParentAsset = mongoose.model("ParentAsset", parentAssetSchema);

export default ParentAsset;
