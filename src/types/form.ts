export type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date';

export type ValidationRule = {
  type: 'required' | 'minLength' | 'maxLength' | 'email' | 'password';
  value?: number; // length constraint if applicable
  message: string;
};

export interface FieldConfig {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;          // UI indicator; also enforced by validation rule
  defaultValue?: any;          // applied in preview initial values
  options?: { label: string; value: string }[];
  validations?: ValidationRule[]; // flat array (standardized)

  // Derived field configuration
  isDerived?: boolean;
  parentFields?: string[];
  derivationLogic?: string; // e.g., 'ageFromDOB'
}

export interface FormSchema {
  id: string;
  name: string;
  createdAt: string;
  fields: FieldConfig[];
}
