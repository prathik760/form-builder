import type { FieldConfig } from '../types/form';

export const calculateDerivedValue = (
  field: FieldConfig,
  formValues: Record<string, any>
): any => {
  if (!field.isDerived || !field.derivationLogic) return '';

  try {
    if (
      field.derivationLogic === 'ageFromDOB' &&
      formValues[field.parentFields?.[0] || '']
    ) {
      const dob = new Date(formValues[field.parentFields?.[0] || '']);
      if (isNaN(dob.getTime())) return '';
      const diff = Date.now() - dob.getTime();
      return Math.abs(new Date(diff).getUTCFullYear() - 1970);
    }

    
    return '';
  } catch (e) {
    console.error('Derivation error:', e);
    return '';
  }
};
