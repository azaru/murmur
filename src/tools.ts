import { appendFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  createBashToolDefinition, createEditToolDefinition, createFindToolDefinition, createGrepToolDefinition, createLsToolDefinition,
  createReadToolDefinition, createWriteToolDefinition, defineTool, type ToolDefinition, withFileMutationQueue,
} from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import type { Profile } from "./profile.ts";

const BUILTIN = {
  read: createReadToolDefinition, bash: createBashToolDefinition, edit: createEditToolDefinition, write: createWriteToolDefinition,
  grep: createGrepToolDefinition, find: createFindToolDefinition, ls: createLsToolDefinition,
} as const;

/** File tools that differ from Pi's: built-in tools whose description the profile replaces, and append when the profile offers it. */
export function fileTools({ tools, toolDescriptions, append }: Profile, workspace: string) {
  const replaced = tools.filter(name => toolDescriptions[name] !== undefined)
    .map(name => ({ ...BUILTIN[name as keyof typeof BUILTIN](workspace), description: toolDescriptions[name] }) as ToolDefinition<any, any>);
  const appendTool = defineTool({
    name: "append", label: "append",
    description: toolDescriptions.append ?? "Add content to the end of a file, keeping what is already there. Creates the file (and parent directories) if it does not exist. Use it to write a long file in several parts.",
    promptSnippet: "Add text to the end of a file",
    parameters: Type.Object({
      path: Type.String({ description: "Path to the file (relative or absolute)" }),
      content: Type.String({ description: "Text to add at the end of the file, exactly as it should appear" }),
    }),
    async execute(_id, { path, content }) {
      const target = resolve(workspace, path);
      await withFileMutationQueue(target, async () => {
        await mkdir(dirname(target), { recursive: true });
        await appendFile(target, content, "utf8");
      });
      return { content: [{ type: "text" as const, text: `Appended ${content.length} characters to ${path}.` }], details: {} };
    },
  });
  return [...replaced, ...(append ? [appendTool] : [])];
}
