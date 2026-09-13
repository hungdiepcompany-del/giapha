export async function resolve(specifier, context, nextResolve) {
  if (
    specifier === "./recoverability" &&
    context.parentURL?.endsWith("/services/backup-service/src/index.ts")
  ) {
    return nextResolve("./recoverability.ts", context);
  }
  return nextResolve(specifier, context);
}
