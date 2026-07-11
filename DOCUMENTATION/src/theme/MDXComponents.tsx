import MDXComponents from "@theme-original/MDXComponents";
import TerminalDemo from "@site/src/components/TerminalDemo";

// Make <TerminalDemo /> usable in any .md/.mdx doc without an import.
export default {
  ...MDXComponents,
  TerminalDemo,
};
