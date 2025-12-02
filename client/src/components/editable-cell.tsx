import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface EditableCellProps {
  value: any;
  type: string;
  onSave: (value: any) => void;
  options?: string[];
  dataKey?: string;
}

export function EditableCell({ value, type, onSave, options, dataKey }: EditableCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  const handleSave = () => {
    let processedValue = editValue;
    
    if (type === 'number') {
      processedValue = parseInt(editValue) || 0;
    } else if (type === 'currency') {
      processedValue = parseFloat(editValue.toString().replace(/[^0-9.]/g, '')) || 0;
      processedValue = processedValue.toFixed(2);
    }
    
    onSave(processedValue);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const getPlaceholder = () => {
    if (dataKey === 'code') return "Enter code...";
    if (dataKey === 'location') return "Enter location...";
    if (dataKey === 'route') return "Select route...";
    if (dataKey === 'delivery') return "Select delivery...";
    if (dataKey === 'latitude') return "e.g. 3.139003";
    if (dataKey === 'longitude') return "e.g. 101.686855";
    if (type === 'currency') return "0.00";
    if (type === 'number') return "Enter number";
    return undefined;
  };

  // For code, location, route, delivery - use popover style
  if (['code', 'location', 'route', 'delivery'].includes(dataKey || '')) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <span
            className="cursor-pointer hover:bg-blue-500/10 hover:border hover:border-blue-500/30 rounded px-2 py-1 transition-all inline-block min-w-[60px] text-center"
            data-testid="text-editable-cell"
          >
            {value || <span className="text-gray-400">—</span>}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="center">
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Edit {dataKey}
            </div>
            
            {type === 'select' && options ? (
              <Select 
                value={editValue} 
                onValueChange={(newValue) => {
                  setEditValue(newValue);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={getPlaceholder()} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={getPlaceholder()}
                className="w-full"
                data-testid="input-editable-cell"
              />
            )}
            
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-7 px-2"
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="h-7 px-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="w-3 h-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // For other columns - keep old inline style
  const [isEditing, setIsEditing] = useState(false);
  
  if (isEditing) {
    if (type === 'select' && options) {
      return (
        <Select 
          value={editValue} 
          onValueChange={(newValue) => {
            setEditValue(newValue);
            onSave(newValue);
            setIsEditing(false);
          }}
        >
          <SelectTrigger className="w-full h-6 px-2 py-1 text-sm bg-transparent border-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    
    return (
      <Input
        ref={inputRef}
        type={type === 'number' || type === 'currency' ? 'number' : 'text'}
        step={type === 'currency' ? '0.01' : undefined}
        value={type === 'currency' ? editValue.toString().replace(/[^0-9.]/g, '') : editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={getPlaceholder()}
        className="w-full h-6 px-2 py-1 text-sm cell-editing ios-glass-input border-none"
        data-testid="input-editable-cell"
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 transition-colors"
      data-testid="text-editable-cell"
    >
      {value}
    </span>
  );
}
