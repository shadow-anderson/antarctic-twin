"use client";

import React, { useState } from "react";
import { AssetNode, AssetStatus } from "@/lib/types";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  HardDrive,
  Menu,
} from "lucide-react";

interface AssetTreeProps {
  nodes: AssetNode[];
  selectedId: string | null;
  onSelectNode: (node: AssetNode) => void;
  onToggleSidebar: () => void;
}

interface TreeNodeItemProps {
  node: AssetNode;
  selectedId: string | null;
  onSelectNode: (node: AssetNode) => void;
  depth?: number;
}

/* =========================================================
   STATUS DOT
========================================================= */

const StatusDot: React.FC<{ status?: AssetStatus }> = ({ status }) => {
  if (!status) return null;

  const colorMap: Record<string, string> = {
    healthy:
      "bg-[#4F8A6B] shadow-[0_0_0_3px_rgba(79,138,107,0.12)]",

    warning:
      "bg-[#B98232] shadow-[0_0_0_3px_rgba(185,130,50,0.12)]",

    critical:
      "bg-[#B65C5C] shadow-[0_0_0_3px_rgba(182,92,92,0.12)]",
  };

  return (
    <span
      className={`w-2 h-2 rounded-full flex-shrink-0 ${
        colorMap[status] || "bg-[#B8C5CA]"
      }`}
      title={`Status: ${status}`}
    />
  );
};

/* =========================================================
   TREE NODE
========================================================= */

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  selectedId,
  onSelectNode,
  depth = 0,
}) => {
  const hasChildren = Boolean(
    node.children && node.children.length > 0
  );

  const [isOpen, setIsOpen] = useState<boolean>(true);

  const isSelected = selectedId === node.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      onSelectNode(node);
    }
  };

  return (
    <div className="select-none font-sans">

      {/* NODE */}
      <div
        onClick={handleClick}
        style={{
          paddingLeft: `${depth * 16 + 10}px`,
        }}
        className={`group relative flex items-center justify-between gap-3 py-2.5 pr-3 my-1 rounded-xl cursor-pointer transition-all duration-150 text-xs ${
          isSelected
            ? "bg-gradient-to-r from-[#DDEDEF] to-[#EAF3F3] text-[#294B58] border border-[#BFD9DE] shadow-[0_3px_10px_rgba(63,110,122,0.08)]"
            : hasChildren
            ? "text-[#405B66] hover:bg-[#E5EEF0] font-semibold"
            : "text-[#71838C] hover:text-[#405B66] hover:bg-[#E8F0F1]"
        }`}
      >

        {/* Selected indicator */}
        {isSelected && (
          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#4C8794]" />
        )}

        <div className="flex items-center gap-2.5 min-w-0">

          {/* Expand / Collapse */}
          {hasChildren ? (
            <button
              type="button"
              aria-label={
                isOpen ? "Collapse folder" : "Expand folder"
              }
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className={`flex items-center justify-center w-5 h-5 rounded-md transition-colors ${
                isSelected
                  ? "text-[#4C8794] hover:bg-[#CFE3E7]"
                  : "text-[#8A9BA3] hover:text-[#4C8794] hover:bg-[#DCE9EC]"
              }`}
            >
              {isOpen ? (
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.2]" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.2]" />
              )}
            </button>
          ) : (
            <span className="w-5 shrink-0" />
          )}

          {/* Folder / Asset icon */}
          {hasChildren ? (
            <span
              className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${
                isSelected
                  ? "bg-[#CDE3E7] text-[#477D8A]"
                  : "bg-[#E2ECEE] text-[#78919A] group-hover:bg-[#D8E7EA]"
              }`}
            >
              <Folder
                className="w-4 h-4 stroke-[1.7]"
                fill="currentColor"
                fillOpacity={0.12}
              />
            </span>
          ) : (
            <span
              className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${
                isSelected
                  ? "bg-[#CDE3E7] text-[#477D8A]"
                  : "bg-[#E8EFF1] text-[#8AA0A8] group-hover:bg-[#DDE9EC]"
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 stroke-[1.8]" />
            </span>
          )}

          {/* Name */}
          <span
            className={`truncate tracking-normal ${
              isSelected
                ? "font-bold"
                : hasChildren
                ? "font-semibold"
                : ""
            }`}
            title={node.label}
          >
            {node.label}
          </span>

        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">

          {hasChildren && (
            <span
              className={`min-w-[22px] px-1.5 py-0.5 text-center rounded-md text-[10px] font-bold ${
                isSelected
                  ? "bg-[#D0E5E9] text-[#527985]"
                  : "bg-[#E1EAEC] text-[#8A9BA3]"
              }`}
            >
              {node.children?.length}
            </span>
          )}

          <StatusDot status={node.status} />

        </div>
      </div>

      {/* CHILDREN */}
      {hasChildren && isOpen && (
        <div className="relative ml-5 my-1 pl-2 border-l border-[#D6E2E5]">

          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelectNode={onSelectNode}
              depth={depth + 1}
            />
          ))}

        </div>
      )}

    </div>
  );
};

/* =========================================================
   ASSET TREE
========================================================= */

export const AssetTree: React.FC<AssetTreeProps> = ({
  nodes,
  selectedId,
  onSelectNode,
  onToggleSidebar,
}) => {
  return (
    <div className="w-full h-full flex flex-col rounded-[22px] bg-[#F7FAFA] border border-[#DCE6E8] p-4 shadow-[0_4px_16px_rgba(50,75,85,0.04)]">

      {/* ===================================================
          TREE HEADER
      =================================================== */}
      <div className="flex items-center gap-3 pb-4 mb-3 border-b border-[#DEE8EA]">

        {/* ================================================
            HAMBURGER BUTTON
        ================================================= */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Hide asset hierarchy"
          title="Hide asset hierarchy"
          className="flex items-center justify-center w-9 h-9 shrink-0 rounded-xl bg-[#DCEBED] border border-[#BFD4D8] text-[#456F7B] shadow-sm hover:bg-[#CFE2E6] hover:text-[#315B67] transition-all duration-200 cursor-pointer"
        >
          <Menu
            className="w-5 h-5"
            strokeWidth={2.5}
          />
        </button>

        {/* ================================================
            ASSET ICON
        ================================================= */}
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#E1ECEF] text-[#56818D] shrink-0">
          <HardDrive className="w-4 h-4" />
        </div>

        {/* ================================================
            TITLE
        ================================================= */}
        <div className="min-w-0 flex-1">

          <h3 className="text-sm font-bold tracking-tight text-[#405964]">
            Subsystem Asset Hierarchy
          </h3>

          <p className="text-[11px] leading-5 text-[#87989F]">
            Select an asset node to inspect live state
          </p>

        </div>

        {/* ================================================
            DIGITAL TWIN BADGE
        ================================================= */}
        <span className="shrink-0 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#E5EFF0] text-[#64838C] border border-[#D4E4E7]">
          Digital Twin
        </span>

      </div>

      {/* ===================================================
          TREE CONTENT
      =================================================== */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-1">

        {nodes.length > 0 ? (
          nodes.map((node) => (
            <TreeNodeItem
              key={node.id}
              node={node}
              selectedId={selectedId}
              onSelectNode={onSelectNode}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">

            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#E8EFF1] text-[#8AA0A8] mb-3">
              <HardDrive className="w-5 h-5" />
            </div>

            <p className="text-xs font-semibold text-[#71838C]">
              No assets available
            </p>

            <p className="text-[11px] text-[#9AA8AE] mt-1">
              Asset hierarchy is currently empty.
            </p>

          </div>
        )}

      </div>
    </div>
  );
};