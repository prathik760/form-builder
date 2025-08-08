import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import type { RootState, AppDispatch } from '../store';
import { loadFormsFromLocalStorage } from '../utils/localStorage';
import { setSavedForms } from '../store/formBuilderSlice';

const MyForms: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { savedForms } = useSelector((state: RootState) => state.formBuilder);

  useEffect(() => {
    const loaded = loadFormsFromLocalStorage();
    dispatch(setSavedForms(loaded));
  }, [dispatch]);

  const handlePreview = (formId: string) => {
    navigate(`/preview/${formId}`);
  };

  return (
    <Box sx={{ px: 3, py: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        My Forms
      </Typography>

      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 3 }}
        onClick={() => navigate('/create')}
      >
        Create New Form
      </Button>

      {savedForms.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }} elevation={1}>
          <Typography color="text.secondary">No forms saved yet</Typography>
        </Paper>
      ) : (
        <Paper elevation={2}>
          <List disablePadding>
            {savedForms.map((form, idx) => (
              <React.Fragment key={form.id}>
                <ListItem
                  divider
                  sx={{ px: 3, py: 2 }}
                  secondaryAction={
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(form.id);
                      }}
                    >
                      Preview
                    </Button>
                  }
                  onClick={() => handlePreview(form.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <ListItemText
                    primary={form.name}
                    secondary={`Created: ${new Date(form.createdAt).toLocaleString()} | Fields: ${form.fields.length}`}
                  />
                </ListItem>
                {idx < savedForms.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default MyForms;
