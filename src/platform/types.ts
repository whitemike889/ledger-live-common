import type { SignedOperation } from "../types";

export type {
  Account as PlatformAccount,
  Currency as PlatformCurrency,
  Unit as PlatformUnit,
  Transaction as PlatformTransaction,
} from "@ledgerhq/live-app-sdk";

export type TranslatableString = {
  en: string;
  [locale: string]: string;
};

export type AppPlatform =
  | "desktop" // == windows || mac || linux
  | "mobile" // == android || ios
  | "all";

export type AppBranch = "stable" | "experimental" | "soon" | "debug";

export type AppPermission = {
  method: string;
  params?: any;
};

export type AppManifest = {
  id: string;
  private?: boolean;
  name: string;
  url: string;
  homepageUrl: string;
  supportUrl?: string;
  icon?: string | null;
  platform: AppPlatform;
  apiVersion: string;
  manifestVersion: string;
  branch: AppBranch;
  params?: any;
  categories: string[];
  currencies: string[] | "*";
  content: {
    shortDescription: TranslatableString;
    description: TranslatableString;
  };
  permissions: AppPermission[];
  domains: string[];
};

export type PromotedApp = {
  id: string; // Should match the id in /platform/apps/v1/data.json
  thumbnailUrl: string; // Should match an image in /icons/platform/thumbnails/
};

export type AppMetadata = {
  /**
   * Identifier of the Live App.
   * Should match the id in platform/apps/v1/data.json
   *  */
  id: string;

  /**
   * Identifier of a category for this app. The purpose is to show it as a tag
   * in Ledger Live.
   */
  category: string;

  /**
   * Identifier of a supercategory for this app. The purpose is to use this for
   * filtering apps in Ledger Live
   */
  supercategory: string;
};

/**
 * Typing for ./data.json
 */
export type CatalogMetadata = {
  compatibleAppsManifestVersions: string[];
  /**
   * List of all existing categories.
   */
  categories: string[];

  /**
   * List of all existing supercategories.
   */
  supercategories: string[];
  /**
   * Sorted array of the promoted apps.
   * The first app in the array will be the first of the promoted apps displayed
   * in Ledger Live and the rest will follow in that order.
   */
  promotedApps: PromotedApp[];
  /**
   * Metadata for the catalog (data for filters etc.)
   */
  appsMetadata: AppMetadata[];
};

export type PlatformApi = {
  fetchManifest: () => Promise<AppManifest[]>;
  fetchCatalog: () => Promise<CatalogMetadata>;
};

export type PlatformSignedTransaction = SignedOperation;
