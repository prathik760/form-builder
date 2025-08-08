import type { ValidationRule } from '../types/form';

export const validateField = (value: any, validations?: ValidationRule[]) => {
  if (!validations || validations.length === 0) return '';

  for (const validation of validations) {
    switch (validation.type) {
      case 'required': {
        const empty =
          value === null ||
          value === undefined ||
          (typeof value === 'string' && value.trim() === '') ||
          value === false;
        if (empty) return validation.message;
        break;
      }
      case 'minLength': {
        const valStr = value === null || value === undefined ? '' : String(value);
        if (validation.value !== undefined && valStr.length < validation.value) {
          return validation.message;
        }
        break;
      }
      case 'maxLength': {
        const valStr = value === null || value === undefined ? '' : String(value);
        if (validation.value !== undefined && valStr.length > validation.value) {
          return validation.message;
        }
        break;
      }
      case 'email': {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
          return validation.message;
        }
        break;
      }
      case 'password': {
        const valStr = String(value || '');
        if (valStr.length < 8 || !/\d/.test(valStr)) {
          return validation.message;
        }
        break;
      }
      default:
        break;
    }
  }

  return '';
};
