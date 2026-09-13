export async function resolve(specifier, context, nextResolve) {
  if (
    ((specifier === "./recoverability" || specifier === "./production-preflight") &&
      context.parentURL?.endsWith("/services/backup-service/src/index.ts")) ||
    (specifier === "./production-crypto" &&
      context.parentURL?.endsWith("/services/backup-service/src/production-preflight.ts"))
  ) {
    return nextResolve(`${specifier}.ts`, context);
  }
  return nextResolve(specifier, context);
}
