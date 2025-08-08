import React, { useState } from 'react';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Typography,
  Divider,
  Switch,
} from '@mui/material';
import DerivedFieldEditor from './DerivedFieldEditor';
import type { FieldConfig, FieldType, ValidationRule } from '../types/form';

interface Props {
  field?: FieldConfig;
  onSave: (field: FieldConfig) => void;
  onCancel: () => void;
  existingFields: FieldConfig[];
}

const normalizeConfig = (cfg: FieldConfig): FieldConfig => ({
  ...cfg,
  options: cfg.options ?? [],
  validations: cfg.validations ?? [],
  required: cfg.required ?? false,
  isDerived: cfg.isDerived ?? false,
  defaultValue: cfg.defaultValue ?? '',
});

const FieldEditor: React.FC<Props> = ({
  field,
  onSave,
  onCancel,
  existingFields = [],
}) => {
  const [config, setConfig] = useState<FieldConfig>(
    field
      ? normalizeConfig(field)
      : {
          id: Date.now().toString(),
          type: 'text',
          label: '',
          required: false,
          defaultValue: '',
          isDerived: false,
          options: [],
          validations: [],
        }
  );

  type ValidationTypeOption = ValidationRule['type'] | '';
  const [validationType, setValidationType] = useState<ValidationTypeOption>('');
  const [validationValue, setValidationValue] = useState<string>('');
  const [validationMessage, setValidationMessage] = useState<string>('');

  const updateRequired = (required: boolean) => {
    setConfig((prev) => {
      const current = normalizeConfig(prev);
      const updatedValidations = (current.validations ?? []).filter(
        (v) => v.type !== 'required'
      );
      if (required) {
        updatedValidations.unshift({
          type: 'required',
          message: 'This field is required',
        });
      }
      return { ...current, required, validations: updatedValidations };
    });
  };

  const addValidation = () => {
    if (!validationType) return;

    const newRule: ValidationRule = {
      type: validationType as ValidationRule['type'],
      value:
        validationType === 'minLength' || validationType === 'maxLength'
          ? Number.parseInt(validationValue, 10) || 0
          : undefined,
      message: validationMessage || 'Invalid value',
    };

    setConfig((prev) => {
      const current = normalizeConfig(prev);
      return {
        ...current,
        validations: [...(current.validations ?? []), newRule],
      };
    });

    setValidationType('');
    setValidationValue('');
    setValidationMessage('');
  };

  const removeValidation = (index: number) => {
    setConfig((prev) => {
      const current = normalizeConfig(prev);
      const validations = [...(current.validations ?? [])];
      validations.splice(index, 1);
      return { ...current, validations };
    });
  };

  const updateFieldType = (type: FieldType) => {
    setConfig((prev) => {
      const current = normalizeConfig(prev);
      return {
        ...current,
        type,
        options: ['select', 'radio'].includes(type) ? current.options ?? [] : [],
        defaultValue: '',
      };
    });
  };

  const renderOptions = ['select', 'radio'].includes(config.type);

  return (
    <div style={{ padding: 16, border: '1px solid #eee', borderRadius: 4, marginBottom: 16 }}>
      <Typography variant="h6">{field ? 'Edit Field' : 'Add New Field'}</Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>Field Type</InputLabel>
        <Select
          value={config.type}
          label="Field Type"
          onChange={(e) => updateFieldType(e.target.value as FieldType)}
        >
          {['text', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date'].map((type) => (
            <MenuItem key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        margin="normal"
        label="Label"
        value={config.label}
        onChange={(e) => setConfig({ ...config, label: e.target.value })}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={!!config.required}
            onChange={(e) => updateRequired(e.target.checked)}
          />
        }
        label="Required"
      />

      <TextField
        fullWidth
        margin="normal"
        label="Default Value"
        value={String(config.defaultValue ?? '')}
        disabled={!!config.isDerived}
        onChange={(e) => setConfig({ ...config, defaultValue: e.target.value })}
        placeholder={config.type === 'checkbox' ? 'Use true/false in code' : 'Default value for preview'}
      />

      {renderOptions && (
        <TextField
          fullWidth
          margin="normal"
          label="Options (comma separated)"
          value={(config.options ?? []).map((opt) => opt.label).join(',')}
          onChange={(e) =>
            setConfig({
              ...config,
              options: e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
                .map((label) => ({ label, value: label })),
            })
          }
        />
      )}

      <Divider style={{ margin: '16px 0' }} />

      <Typography variant="subtitle1">Validations</Typography>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <FormControl style={{ minWidth: 160 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={validationType}
            label="Type"
            onChange={(e) => setValidationType(e.target.value as ValidationTypeOption)}
          >
            <MenuItem value="">Select</MenuItem>
            {(['required', 'minLength', 'maxLength', 'email', 'password'] as ValidationRule['type'][]).map(
              (type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>

        {(validationType === 'minLength' || validationType === 'maxLength') && (
          <TextField
            type="number"
            label="Value"
            value={validationValue}
            onChange={(e) => setValidationValue(e.target.value)}
            style={{ width: 140 }}
            inputProps={{ min: 0 }}
          />
        )}

        <TextField
          label="Error Message"
          value={validationMessage}
          onChange={(e) => setValidationMessage(e.target.value)}
          style={{ flexGrow: 1, minWidth: 240 }}
        />

        <Button variant="outlined" onClick={addValidation}>
          Add
        </Button>
      </div>

      {(config.validations ?? []).map((v, i) => (
        <div key={`${v.type}-${i}`} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ flexGrow: 1 }}>
            {v.type} {typeof v.value !== 'undefined' ? `(${v.value})` : ''}: {v.message}
          </span>
          <Button size="small" onClick={() => removeValidation(i)}>
            Remove
          </Button>
        </div>
      ))}

      <Divider style={{ margin: '16px 0' }} />

      <FormControlLabel
        control={
          <Switch
            checked={!!config.isDerived}
            onChange={(e) =>
              setConfig((prev) => {
                const next = { ...prev, isDerived: e.target.checked };
                if (e.target.checked) {
                  next.defaultValue = '';
                }
                return normalizeConfig(next);
              })
            }
          />
        }
        label="Derived field"
      />

      {config.isDerived && (
        <DerivedFieldEditor
          field={config}
          parentFields={existingFields ?? []}
          onSave={(updates) => setConfig(normalizeConfig({ ...config, ...updates }))}
          onCancel={() => setConfig((prev) => normalizeConfig({ ...prev, isDerived: false }))}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => onSave(normalizeConfig(config))}
          disabled={!config.label.trim()}
        >
          Save Field
        </Button>
      </div>
    </div>
  );
};

export default FieldEditor;
