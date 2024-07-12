import type { PluginDescription } from "./plugin-description";
import { registeredPlugins } from "../../plugins";

export const pluginMetadata: Array<PluginDescription> = registeredPlugins.map(
  (p) => new p().describe(),
);
export const pluginIDs: string[] = pluginMetadata.map((d) => d.id);

export const ttsPlugins = registeredPlugins.filter((p) => {
  const instance = new p();
});

export function getPluginByName(name: string) {
  return registeredPlugins.find((p) => new p().describe().name === name);
}
