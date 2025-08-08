import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
} from '@mui/material';
import FieldList from '../components/FieldList';
import { loadFormsFromLocalStorage, saveFormsToLocalStorage } from '../utils/localStorage';
import type { RootState } from '../store';
import { setCurrentFields } from '../store/formBuilderSlice';
import type { FieldConfig, FormSchema } from '../types/form';

const CreateForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentForm } = useSelector((state: RootState) => state.formBuilder);
  const currentFields: FieldConfig[] = currentForm?.fields ?? [];

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [formName, setFormName] = useState('');

  const updateFields = useCallback(
    (fields: FieldConfig[]) => {
      dispatch(setCurrentFields(fields));
    },
    [dispatch]
  );

  const handleOpenSave = () => setSaveDialogOpen(true);
  const handleCloseSave = () => {
    setSaveDialogOpen(false);
  };

  const handleSaveForm = () => {
    const name = formName.trim();
    if (!name || currentFields.length === 0) return;

    const savedForms = loadFormsFromLocalStorage();
    const newForm: FormSchema = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString(),
      fields: currentFields,
    };

    savedForms.push(newForm);
    saveFormsToLocalStorage(savedForms);

    setFormName('');
    setSaveDialogOpen(false);
    navigate('/myforms');
  };

  const canProceed = currentFields.length > 0;

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Create Form
      </Typography>

      <FieldList fields={currentFields} onUpdate={updateFields} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/preview')}
          disabled={!canProceed}
        >
          Preview Form
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenSave}
          disabled={!canProceed}
        >
          Save Form
        </Button>
      </Box>

      <Dialog open={saveDialogOpen} onClose={handleCloseSave} fullWidth maxWidth="sm">
        <DialogTitle>Save Form</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Form Name"
            fullWidth
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g., Employee Onboarding"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSave}>Cancel</Button>
          <Button onClick={handleSaveForm} disabled={!formName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateForm;
