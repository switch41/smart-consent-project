/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as analytics from "../analytics.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as consents from "../consents.js";
import type * as cookies from "../cookies.js";
import type * as http from "../http.js";
import type * as riskAssessments from "../riskAssessments.js";
import type * as seedData from "../seedData.js";
import type * as trackers from "../trackers.js";
import type * as users from "../users.js";
import type * as websites from "../websites.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  consents: typeof consents;
  cookies: typeof cookies;
  http: typeof http;
  riskAssessments: typeof riskAssessments;
  seedData: typeof seedData;
  trackers: typeof trackers;
  users: typeof users;
  websites: typeof websites;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
