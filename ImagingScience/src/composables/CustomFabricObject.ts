import type { FabricObject } from "fabric";

// Generic type for all fabric objects with a custom type/ custom feature
export interface CustomFabricObject extends FabricObject {
  customType?: string;
  sigma?: number;
  cyclesX?: number;
  cyclesY?: number;
  rows?: number;
  columns?: number;
}