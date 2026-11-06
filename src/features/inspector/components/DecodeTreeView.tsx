import { CopyableTreeView } from "@/inspector/components/CopyableTreeView"

interface DecodeTreeViewProps {
  tree: Record<string, unknown>;
  expandAll?: boolean;
}

export function DecodeTreeView({ tree, expandAll }: DecodeTreeViewProps) {
  return <CopyableTreeView tree={tree} expandAll={expandAll} />
}
