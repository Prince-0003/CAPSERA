// Lets `node --test` load the app's TypeScript modules directly (Node strips the types itself):
// maps the "@/..." path alias to the project root and resolves extensionless imports to ".ts".
import { registerHooks } from "node:module";

const root = new URL("../", import.meta.url);

registerHooks({
  resolve(specifier, context, nextResolve) {
    const target = specifier.startsWith("@/") ? new URL(specifier.slice(2), root).href : specifier;
    try {
      return nextResolve(target, context);
    } catch (error) {
      const relative = target.startsWith(".") || target.startsWith("file:");
      if (relative && error?.code === "ERR_MODULE_NOT_FOUND") return nextResolve(`${target}.ts`, context);
      throw error;
    }
  },
});
