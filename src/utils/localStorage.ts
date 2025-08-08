import type { FormSchema } from '../types/form';
const FORMS_KEY = 'savedForms';

export const saveFormsToLocalStorage = (forms: FormSchema[]) => {
  localStorage.setItem(FORMS_KEY, JSON.stringify(forms));
};

export const loadFormsFromLocalStorage = (): FormSchema[] => {
  const data = localStorage.getItem(FORMS_KEY);
  return data ? JSON.parse(data) : [];
};

export const addFormToLocalStorage = (form: FormSchema) => {
  const forms = loadFormsFromLocalStorage();
  forms.push(form);
  saveFormsToLocalStorage(forms);
};
