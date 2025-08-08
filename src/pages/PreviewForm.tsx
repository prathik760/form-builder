import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  FormHelperText,
  FormLabel,
} from '@mui/material';
import type { RootState } from '../store';
import { validateField } from '../utils/validators';
import { calculateDerivedValue } from '../utils/derived';
import type { FieldConfig, FormSchema, ValidationRule } from '../types/form';

const ensureRequiredRule = (field: FieldConfig): ValidationRule[] => {
  const arr = [...(field.validations || [])];
  if (field.required && !arr.some((v) => v.type === 'required')) {
    arr.unshift({ type: 'required', message: 'This field is required' });
  }
  return arr;
};

const PreviewForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { currentForm, savedForms } = useSelector((state: RootState) => state.formBuilder);

  const formSchema: FormSchema | null = useMemo(() => {
    if (id) {
      return savedForms.find((form) => form.id === id) || null;
    }
    if (currentForm?.fields?.length) {
      return {
        id: 'current',
        name: currentForm.name || 'Form Preview',
        createdAt: '',
        fields: currentForm.fields,
      };
    }
    return null;
  }, [id, savedForms, currentForm]);

  const initialValues = useMemo(() => {
    const values: Record<string, any> = {};
    formSchema?.fields.forEach((field) => {
      if (!field.isDerived) {
        if (field.type === 'checkbox') {
          values[field.id] = typeof field.defaultValue === 'boolean' ? field.defaultValue : false;
        } else {
          values[field.id] = field.defaultValue ?? '';
        }
      }
    });
    return values;
  }, [formSchema]);

  const [formValues, setFormValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset when schema changes
  useEffect(() => {
    setFormValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const derivedValues = useMemo(() => {
    const map: Record<string, any> = {};
    if (!formSchema) return map;
    for (const field of formSchema.fields) {
      if (field.isDerived) {
        try {
          map[field.id] = calculateDerivedValue(field, formValues);
        } catch (e) {
          map[field.id] = ''; // prevent crash if formula errors
        }
      }
    }
    return map;
  }, [formSchema, formValues]);

  const handleChange = (fieldId: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validateOne = (field: FieldConfig): string => {
    if (field.isDerived) return '';
    const rules = ensureRequiredRule(field);
    // Special-case required checkbox: must be true
    const value =
      field.type === 'checkbox'
        ? !!formValues[field.id]
        : formValues[field.id];

    return validateField(value, rules) || '';
  };

  const handleBlur = (field: FieldConfig) => {
    const msg = validateOne(field);
    if (msg) {
      setErrors((prev) => ({ ...prev, [field.id]: msg }));
    } else if (errors[field.id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field.id];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    let isValid = true;

    formSchema?.fields.forEach((field) => {
      const msg = validateOne(field);
      if (msg) {
        newErrors[field.id] = msg;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (isValid) {
      alert('Form submitted successfully!');
      // per spec: do not persist end-user responses
    }
  };

  const renderField = (field: FieldConfig) => {
    const error = errors[field.id];
    const requiredMark = field.required ? ' *' : '';

    if (field.isDerived) {
      const derivedValue = derivedValues[field.id] ?? '';
      return (
        <TextField
          key={field.id}
          label={field.label}
          value={derivedValue}
          fullWidth
          margin="normal"
          InputProps={{ readOnly: true }}
        />
      );
    }

    switch (field.type) {
      case 'text':
      case 'number':
      case 'textarea':
      case 'date':
        return (
          <TextField
            key={field.id}
            required={field.required}
            label={field.label + requiredMark}
            type={
              field.type === 'date'
                ? 'date'
                : field.type === 'textarea'
                ? undefined
                : field.type
            }
            value={formValues[field.id] ?? ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            onBlur={() => handleBlur(field)}
            fullWidth
            margin="normal"
            multiline={field.type === 'textarea'}
            rows={field.type === 'textarea' ? 4 : undefined}
            error={!!error}
            helperText={error}
            InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
          />
        );

      case 'select':
        return (
          <FormControl key={field.id} fullWidth margin="normal" error={!!error} required={field.required}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={formValues[field.id] ?? ''}
              label={field.label}
              onChange={(e) => handleChange(field.id, e.target.value)}
              onBlur={() => handleBlur(field)}
            >
              {(field.options || []).map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case 'radio':
        return (
          <FormControl key={field.id} component="fieldset" margin="normal" error={!!error} required={field.required}>
            <FormLabel component="legend">{field.label + requiredMark}</FormLabel>
            <RadioGroup
              value={formValues[field.id] ?? ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              onBlur={() => handleBlur(field)}
            >
              {(field.options || []).map((option) => (
                <FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.label} />
              ))}
            </RadioGroup>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControl key={field.id} margin="normal" error={!!error} required={field.required}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!formValues[field.id]}
                  onChange={(e) => handleChange(field.id, e.target.checked)}
                  onBlur={() => handleBlur(field)}
                />
              }
              label={field.label + requiredMark}
            />
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      default:
        return null;
    }
  };

  if (!formSchema || !formSchema.fields?.length) {
    return (
      <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
        <Typography variant="h5" gutterBottom>
          No form found
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/create')}>
          Create New Form
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        {formSchema.name || 'Form Preview'}
      </Typography>

      <form onSubmit={handleSubmit} noValidate>
        {formSchema.fields.map((field) => renderField(field))}

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined" onClick={() => navigate(id ? '/myforms' : '/create')}>
            Back
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PreviewForm;
