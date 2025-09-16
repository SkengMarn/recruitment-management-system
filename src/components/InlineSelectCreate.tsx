import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface InlineSelectCreateProps {
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ id: string; name: string; [key: string]: any }>;
  onRefresh: () => void;
  createFields: Array<{
    key: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'select' | 'number';
    placeholder?: string;
    required?: boolean;
    options?: Array<{ value: string; label: string }>;
  }>;
  onCreateRecord: (data: any) => Promise<any>;
  entityName: string;
  className?: string;
}

export default function InlineSelectCreate({
  label,
  placeholder,
  value,
  onValueChange,
  options,
  onRefresh,
  createFields,
  onCreateRecord,
  entityName,
  className = ""
}: InlineSelectCreateProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleCreateClick = () => {
    // Initialize form data with default values
    const initialData: Record<string, any> = {};
    createFields.forEach(field => {
      initialData[field.key] = '';
    });
    setFormData(initialData);
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async () => {
    // Validate required fields
    const missingFields = createFields
      .filter(field => field.required && !formData[field.key])
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    setCreating(true);
    try {
      const result = await onCreateRecord(formData);
      
      // Close modal and refresh options
      setShowCreateModal(false);
      setFormData({});
      await onRefresh();
      
      // Auto-select the newly created record
      const newRecordId = result[entityName.toLowerCase()]?.id || result.id;
      if (newRecordId) {
        onValueChange(newRecordId);
      }
      
      toast.success(`${entityName} created successfully!`);
    } catch (error) {
      console.error(`Create ${entityName} error:`, error);
      toast.error(`Failed to create ${entityName}: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <div className={className}>
        <Label>{label}</Label>
        <div className="flex gap-2">
          <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCreateClick}
            className="px-3"
            title={`Create new ${entityName}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New {entityName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {createFields.map(field => (
              <div key={field.key}>
                <Label htmlFor={field.key}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                
                {field.type === 'select' ? (
                  <Select 
                    value={formData[field.key]} 
                    onValueChange={(value) => handleFieldChange(field.key, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.key}
                    type={field.type}
                    value={formData[field.key]}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={creating}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubmit}
              disabled={creating}
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create {entityName}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
