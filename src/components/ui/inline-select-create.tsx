import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Textarea } from './textarea';
import { Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface InlineSelectCreateProps {
  // Core props
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  label: string;
  
  // Data props
  items: Array<{ id: string; name?: string; full_name?: string; company_name?: string; [key: string]: any }>;
  displayField: string; // 'name', 'full_name', 'company_name', etc.
  
  // Creation props
  createTitle: string;
  createDescription: string;
  createFields: Array<{
    key: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
    required?: boolean;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
  }>;
  
  // API props
  onCreateItem: (data: any) => Promise<{ id: string; [key: string]: any }>;
  
  // Optional props
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const InlineSelectCreate: React.FC<InlineSelectCreateProps> = ({
  value,
  onValueChange,
  placeholder,
  label,
  items,
  displayField,
  createTitle,
  createDescription,
  createFields,
  onCreateItem,
  disabled = false,
  error,
  className = ""
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<Record<string, any>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Initialize form data
  useEffect(() => {
    const initialData: Record<string, any> = {};
    createFields.forEach(field => {
      initialData[field.key] = '';
    });
    setCreateFormData(initialData);
  }, [createFields]);

  const handleCreateInputChange = (key: string, newValue: string) => {
    setCreateFormData(prev => ({
      ...prev,
      [key]: newValue
    }));
  };

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      setCreateError(null);

      // Validate required fields
      const missingFields = createFields
        .filter(field => field.required && !createFormData[field.key]?.trim())
        .map(field => field.label);

      if (missingFields.length > 0) {
        setCreateError(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Create the item
      const newItem = await onCreateItem(createFormData);
      
      // Select the newly created item
      onValueChange(newItem.id);
      
      // Close dialog and reset form
      setIsCreateDialogOpen(false);
      const resetData: Record<string, any> = {};
      createFields.forEach(field => {
        resetData[field.key] = '';
      });
      setCreateFormData(resetData);
      
      toast.success(`${createTitle} created successfully`);
    } catch (err: any) {
      console.error('Create item error:', err);
      setCreateError(err.message || 'Failed to create item');
    } finally {
      setIsCreating(false);
    }
  };

  const renderCreateField = (field: any) => {
    const fieldValue = createFormData[field.key] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={fieldValue}
            onChange={(e) => handleCreateInputChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="min-h-20"
          />
        );
      
      case 'select':
        return (
          <Select 
            value={fieldValue} 
            onValueChange={(value) => handleCreateInputChange(field.key, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            type={field.type}
            value={fieldValue}
            onChange={(e) => handleCreateInputChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      <div className="flex space-x-2">
        <div className="flex-1">
          <Select value={value} onValueChange={onValueChange} disabled={disabled}>
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item[displayField] || item.name || item.full_name || item.company_name || 'Unknown'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              disabled={disabled}
              title={`Create new ${createTitle.toLowerCase()}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{createTitle}</DialogTitle>
              <DialogDescription>{createDescription}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {createFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderCreateField(field)}
                </div>
              ))}
              
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{createError}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCreate}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default InlineSelectCreate;
