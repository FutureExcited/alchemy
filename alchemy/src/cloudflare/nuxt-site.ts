import type { Assets } from "./assets";
import type { Bindings } from "./bindings";
import { Website, type WebsiteProps } from "./website";
import type { Worker } from "./worker";

/**
 * Properties for creating a NuxtSite resource.
 * Extends WebsiteProps, allowing customization of the underlying Website.
 */
export interface NuxtSiteProps<B extends Bindings> extends WebsiteProps<B> {}

/**
 * Represents the output of a NuxtSite resource deployment.
 * It resolves to the underlying Cloudflare Worker type, ensuring type safety.
 * Prevents overriding the internal ASSETS binding.
 */
export type NuxtSite<B extends Bindings> = B extends { ASSETS: any }
  ? never
  : Worker<B & { ASSETS: Assets }>;

/**
 * Creates and deploys a Nuxt application using the Cloudflare Workers preset.
 *
 * This resource simplifies deploying Nuxt applications by providing sensible
 * defaults for the build command, main entrypoint, and assets directory
 * based on the `cloudflare-module` preset output.
 *
 * It wraps the underlying `Website` resource.
 *
 * @param id A unique identifier for the resource.
 * @param props Configuration options for the Nuxt deployment, overriding defaults.
 * @returns A promise that resolves to the deployed Cloudflare Worker details.
 *
 * @example
 * // Deploy a basic Nuxt site with default settings
 * const nuxtSite = await NuxtSite("my-nuxt-app");
 *
 * @example
 * // Deploy with custom bindings and build command
 * const db = await D1Database("my-db");
 * const nuxtSiteWithDb = await NuxtSite("my-nuxt-app-with-db", {
 *   command: "npm run build:cloudflare", // Specify a custom build command
 *   bindings: {
 *     DB: db, // Add custom bindings
 *   },
 * });
 */
export async function NuxtSite<B extends Bindings>(
  id: string,
  props?: Partial<NuxtSiteProps<B>>
): Promise<NuxtSite<B>> {
  // Call the underlying Website resource with Nuxt defaults
  return Website(id, {
    ...props,
    // Default build command, can be overridden by props.command
    command: props?.command ?? "bun run build",
    // Default entry point for cloudflare-module preset
    main: props?.main ?? "./index.ts",
    // Default static assets directory for cloudflare-module preset
    assets: props?.assets ?? "./.output/public",
    // Ensure nodejs_compat flag is included for Nuxt compatibility
    compatibilityFlags: ["nodejs_compat", ...(props?.compatibilityFlags ?? [])],
    // Enable wrangler by default, common for Nuxt/Cloudflare deployments
    wrangler: props?.wrangler ?? true,
  });
}
