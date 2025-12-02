import { GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableColumn } from "@shared/schema";

interface ColumnHeaderProps {
  column: TableColumn;
  dragHandleProps: any;
  onDelete: () => void;
  isAuthenticated?: boolean;
  editMode?: boolean;
}

export function ColumnHeader({ column, dragHandleProps, onDelete, isAuthenticated = false, editMode = false }: ColumnHeaderProps) {
  // Core columns that cannot be deleted (based on dataKey)
  const coreColumnDataKeys = ['id', 'no', 'route', 'code', 'location', 'delivery', 'tngRoute', 'info', 'images', 'kilometer', 'tollPrice'];
  const isCoreColumn = coreColumnDataKeys.includes(column.dataKey);
  
  return (
    <div className="flex items-center justify-center w-full relative">
      <div className="text-center px-3 py-1.5">
        <span className="block font-bold tracking-wide" style={{fontSize: '10px'}}>{column.name}</span>
      </div>
      {!isCoreColumn && (
        <div className="absolute right-0 flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            className={`h-auto p-0 text-sm ${!isAuthenticated ? 'opacity-50 cursor-not-allowed text-muted-foreground' : 'text-muted-foreground hover:text-destructive'}`}
            onClick={() => isAuthenticated && onDelete()}
            disabled={!isAuthenticated}
            title={!isAuthenticated ? "Authentication required to delete columns" : "Delete column"}
            data-testid={`button-delete-column-${column.dataKey}`}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
