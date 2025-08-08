import React, { useState } from 'react';
import type { FieldConfig } from '../types/form';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';

interface DerivedFieldEditorProps {
  field: FieldConfig;
  parentFields: FieldConfig[];
  onSave: (field: FieldConfig) => void;
  onCancel: () => void;
}

const DerivedFieldEditor: React.FC<DerivedFieldEditorProps> = ({ 
  field, 
  parentFields, 
  onSave, 
  onCancel 
}) => {
  const [derivedConfig, setDerivedConfig] = useState({
    parentFields: field.parentFields || [],
    derivationLogic: field.derivationLogic || '',
  });

  const handleSave = () => {
    onSave({
      ...field,
      isDerived: true,
      parentFields: derivedConfig.parentFields,
      derivationLogic: derivedConfig.derivationLogic,
    });
  };

  return (
    <div style={{ padding: '16px', border: '1px solid #eee', borderRadius: '4px', marginBottom: '16px' }}>
      <Typography variant="h6">Configure Derived Field</Typography>
      
      <FormControl fullWidth margin="normal">
        <InputLabel>Parent Fields</InputLabel>
        <Select
          multiple
          value={derivedConfig.parentFields}
          onChange={(e) => setDerivedConfig({
            ...derivedConfig,
            parentFields: e.target.value as string[],
          })}
        >
          {parentFields.filter(f => !f.isDerived).map(f => (
            <MenuItem key={f.id} value={f.id}>{f.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        margin="normal"
        label="Derivation Logic"
        value={derivedConfig.derivationLogic}
        onChange={(e) => setDerivedConfig({
          ...derivedConfig,
          derivationLogic: e.target.value,
        })}
        placeholder="Example: ageFromDOB (for age calculation from date of birth)"
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '8px' }}>
        <Button onClick={onCancel} variant="outlined">Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </div>
    </div>
  );
};

export default DerivedFieldEditor;