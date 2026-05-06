"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Download,
  Upload,
  RefreshCw,
  MoreHorizontal,
  ExternalLink,
  FileText,
  Users,
  Calendar,
  Trophy,
  Image,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  Send,
  Save,
  Filter,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "scholar";
  size?: "default" | "sm" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
  asChild?: boolean;
}

// Base Action Button
export function ActionButton({
  variant = "default",
  size = "default",
  children,
  onClick,
  disabled = false,
  loading = false,
  className,
  icon,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn("gap-2", className)}
      {...props}
    >
      {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
      {icon && !loading && icon}
      {children}
    </Button>
  );
}

// Add Button
export function AddButton({ onClick, disabled = false, children = "Add New", ...props }: Partial<ActionButtonProps>) {
  return (
    <ActionButton
      variant="default"
      onClick={onClick}
      disabled={disabled}
      icon={<Plus className="w-4 h-4" />}
      {...props}
    >
      {children}
    </ActionButton>
  );
}

// Edit Button
export function EditButton({ onClick, disabled = false, ...props }: Partial<ActionButtonProps>) {
  return (
    <ActionButton
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      icon={<Edit className="w-4 h-4" />}
      {...props}
    >
      Edit
    </ActionButton>
  );
}

// Delete Button
export function DeleteButton({ onClick, disabled = false, loading = false, ...props }: Partial<ActionButtonProps>) {
  return (
    <ActionButton
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      icon={<Trash2 className="w-4 h-4" />}
      {...props}
    >
      Delete
    </ActionButton>
  );
}

// View Button
export function ViewButton({ onClick, disabled = false, ...props }: Partial<ActionButtonProps>) {
  return (
    <ActionButton
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      icon={<Eye className="w-4 h-4" />}
      {...props}
    >
      View
    </ActionButton>
  );
}

// Preview Button
export function PreviewButton({ onClick, disabled = false, ...props }: Partial<ActionButtonProps>) {
  return (
    <ActionButton
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      icon={<Eye className="w-4 h-4" />}
      {...props}
    >
      Preview
    </ActionButton>
  );
}

// Duplicate Button
export function DuplicateButton({ onClick, disabled = false, ...props }: Partial<ActionButtonProps>) {
  return (
    <ActionButton
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      icon={<Copy className="w-4 h-4" />}
      {...props}
    >
      Duplicate
    </ActionButton>
  );
}

// Save Button
export function SaveButton({ onClick, disabled = false, loading = false, ...props }: Partial<ActionButtonProps>) {
  return (
    <ActionButton
      variant="default"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      icon={<Save className="w-4 h-4" />}
      {...props}
    >
      {loading ? "Saving..." : "Save"}
    </ActionButton>
  );
}

// Cancel Button
export function CancelButton({ onClick, disabled = false, ...props }: Partial<ActionButtonProps>) {
  return (
    <ActionButton
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      Cancel
    </ActionButton>
  );
}

// Publish Button
export function PublishButton({ onClick, disabled = false, loading = false, ...props }: Partial<ActionButtonProps>) {
  return (
    <ActionButton
      variant="default"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      icon={<Send className="w-4 h-4" />}
      {...props}
    >
      {loading ? "Publishing..." : "Publish"}
    </ActionButton>
  );
}

// Draft Button
export function DraftButton({ onClick, disabled = false, ...props }: Partial<ActionButtonProps>) {
  return (
    <ActionButton
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      icon={<FileText className="w-4 h-4" />}
      {...props}
    >
      Save as Draft
    </ActionButton>
  );
}

// Archive Button
export function ArchiveButton({ onClick, disabled = false, ...props }: Partial<ActionButtonProps>) {
  return (
    <ActionButton
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      icon={<Archive className="w-4 h-4" />}
      {...props}
    >
      Archive
    </ActionButton>
  );
}

// Export Button
export function ExportButton({ onClick, disabled = false, ...props }: Partial<ActionButtonProps>) {
  return (
    <ActionButton
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      icon={<Download className="w-4 h-4" />}
      {...props}
    >
      Export
    </ActionButton>
  );
}

// Import Button
export function ImportButton({ onClick, disabled = false, ...props }: Partial<ActionButtonProps>) {
  return (
    <ActionButton
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      icon={<Upload className="w-4 h-4" />}
      {...props}
    >
      Import
    </ActionButton>
  );
}

// Refresh Button
export function RefreshButton({ onClick, disabled = false, loading = false, ...props }: Partial<ActionButtonProps>) {
  return (
    <ActionButton
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      icon={<RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />}
      {...props}
    >
      Refresh
    </ActionButton>
  );
}

// Search Button
export function SearchButton({ onClick, disabled = false, ...props }: Partial<ActionButtonProps>) {
  return (
    <ActionButton
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      icon={<Search className="w-4 h-4" />}
      {...props}
    >
      Search
    </ActionButton>
  );
}

// Filter Button
export function FilterButton({ onClick, disabled = false, active = false, ...props }: Partial<ActionButtonProps> & { active?: boolean }) {
  return (
    <ActionButton
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      icon={<Filter className="w-4 h-4" />}
      {...props}
    >
      Filters
    </ActionButton>
  );
}

// External Link Button
export function ExternalLinkButton({ href, children, ...props }: { href: string; children: React.ReactNode }) {
  return (
    <ActionButton
      variant="outline"
      size="sm"
      asChild
      {...props}
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="w-4 h-4 mr-2" />
        {children}
      </a>
    </ActionButton>
  );
}

// Status Badge Button
export function StatusBadge({ status, onClick, ...props }: { status: 'published' | 'draft' | 'archived'; onClick?: () => void }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'published':
        return {
          icon: <CheckCircle className="w-3 h-3" />,
          className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
          label: "Published"
        };
      case 'draft':
        return {
          icon: <Clock className="w-3 h-3" />,
          className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
          label: "Draft"
        };
      case 'archived':
        return {
          icon: <Archive className="w-3 h-3" />,
          className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
          label: "Archived"
        };
      default:
        return {
          icon: <Clock className="w-3 h-3" />,
          className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
          label: status
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant="outline"
      className={cn("cursor-pointer gap-1", config.className)}
      onClick={onClick}
      {...props}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}

// Action Dropdown Menu
export function ActionDropdown({ children, ...props }: { children: React.ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" {...props}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Context-specific Action Buttons
export function ProjectActions({ onEdit, onDelete, onDuplicate, onPreview, onView }: {
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onPreview?: () => void;
  onView?: () => void;
}) {
  return (
    <ActionDropdown>
      {onPreview && (
        <DropdownMenuItem onClick={onPreview}>
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </DropdownMenuItem>
      )}
      {onView && (
        <DropdownMenuItem onClick={onView}>
          <ExternalLink className="w-4 h-4 mr-2" />
          View Live
        </DropdownMenuItem>
      )}
      {onEdit && (
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
      )}
      {onDuplicate && (
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
      )}
      {(onDelete || onEdit || onDuplicate) && (
        <DropdownMenuSeparator />
      )}
      {onDelete && (
        <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      )}
    </ActionDropdown>
  );
}

export function TeamActions({ onEdit, onDelete, onDuplicate, onPreview }: {
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onPreview?: () => void;
}) {
  return (
    <ActionDropdown>
      {onPreview && (
        <DropdownMenuItem onClick={onPreview}>
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </DropdownMenuItem>
      )}
      {onEdit && (
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
      )}
      {onDuplicate && (
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
      )}
      {(onDelete || onEdit || onDuplicate) && (
        <DropdownMenuSeparator />
      )}
      {onDelete && (
        <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      )}
    </ActionDropdown>
  );
}

export function ActivityActions({ onEdit, onDelete, onDuplicate }: {
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}) {
  return (
    <ActionDropdown>
      {onEdit && (
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
      )}
      {onDuplicate && (
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
      )}
      {(onDelete || onEdit || onDuplicate) && (
        <DropdownMenuSeparator />
      )}
      {onDelete && (
        <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      )}
    </ActionDropdown>
  );
}

export function AwardActions({ onEdit, onDelete, onDuplicate }: {
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}) {
  return (
    <ActionDropdown>
      {onEdit && (
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
      )}
      {onDuplicate && (
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
      )}
      {(onDelete || onEdit || onDuplicate) && (
        <DropdownMenuSeparator />
      )}
      {onDelete && (
        <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      )}
    </ActionDropdown>
  );
}

export function MediaActions({ onEdit, onDelete, onDownload }: {
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
}) {
  return (
    <ActionDropdown>
      {onDownload && (
        <DropdownMenuItem onClick={onDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </DropdownMenuItem>
      )}
      {onEdit && (
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
      )}
      {(onDelete || onDownload || onEdit) && (
        <DropdownMenuSeparator />
      )}
      {onDelete && (
        <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      )}
    </ActionDropdown>
  );
}
