import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FieldConfig, FormSchema } from '../types/form';

interface FormBuilderState {
  currentForm: {
    name: string;
    fields: FieldConfig[];
  };
  savedForms: FormSchema[];
}

const initialState: FormBuilderState = {
  currentForm: {
    name: '',
    fields: [],
  },
  savedForms: [],
};

export const formBuilderSlice = createSlice({
  name: 'formBuilder',
  initialState,
  reducers: {
    setCurrentFields: (state, action: PayloadAction<FieldConfig[]>) => {
      state.currentForm.fields = action.payload;
    },
    addField: (state, action: PayloadAction<FieldConfig>) => {
      state.currentForm.fields.push(action.payload);
    },
    updateField: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<FieldConfig> }>
    ) => {
      const idx = state.currentForm.fields.findIndex((f) => f.id === action.payload.id);
      if (idx >= 0) {
        state.currentForm.fields[idx] = {
          ...state.currentForm.fields[idx],
          ...action.payload.updates,
        };
      }
    },
    removeField: (state, action: PayloadAction<string>) => {
      state.currentForm.fields = state.currentForm.fields.filter((f) => f.id !== action.payload);
    },
    reorderFields: (state, action: PayloadAction<{ from: number; to: number }>) => {
      const arr = [...state.currentForm.fields];
      const [removed] = arr.splice(action.payload.from, 1);
      arr.splice(action.payload.to, 0, removed);
      state.currentForm.fields = arr;
    },
    saveForm: (state, action: PayloadAction<string>) => {
      const newForm: FormSchema = {
        id: Date.now().toString(),
        name: action.payload,
        createdAt: new Date().toISOString(),
        fields: [...state.currentForm.fields],
      };
      state.savedForms.push(newForm);
      state.currentForm = { name: '', fields: [] };
    },
    loadForm: (state, action: PayloadAction<FormSchema>) => {
      state.currentForm = {
        name: action.payload.name,
        fields: [...action.payload.fields],
      };
    },
    setSavedForms: (state, action: PayloadAction<FormSchema[]>) => {
      state.savedForms = action.payload;
    },
  },
});

export const {
  setCurrentFields,
  addField,
  updateField,
  removeField,
  reorderFields,
  saveForm,
  loadForm,
  setSavedForms,
} = formBuilderSlice.actions;

export default formBuilderSlice.reducer;
