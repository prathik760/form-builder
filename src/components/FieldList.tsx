import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';
import type { FieldConfig } from '../types/form';
import {
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { Delete, Edit, DragHandle } from '@mui/icons-material';
import FieldEditor from './FieldEditor';

interface FieldListProps {
  fields: FieldConfig[];
  onUpdate: (fields: FieldConfig[]) => void;
}

const FieldList: React.FC<FieldListProps> = ({ fields, onUpdate }) => {
  const [editingField, setEditingField] = useState<FieldConfig | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newFields = [...fields];
    const [removed] = newFields.splice(result.source.index, 1);
    newFields.splice(result.destination.index, 0, removed);

    onUpdate(newFields);
  };

  const handleSaveField = (field: FieldConfig) => {
    if (editingField) {
      onUpdate(fields.map((f) => (f.id === field.id ? field : f)));
    } else {
      onUpdate([...fields, field]);
    }
    setEditingField(null);
    setIsAdding(false);
  };

  const handleDeleteField = (id: string) => {
    onUpdate(fields.filter((f) => f.id !== id));
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Form Fields
      </Typography>

      <Button
        variant="contained"
        onClick={() => {
          setEditingField(null);
          setIsAdding(true);
        }}
        style={{ marginBottom: '16px' }}
      >
        Add Field
      </Button>

      {(isAdding || editingField) && (
        <FieldEditor
          key={editingField?.id ?? 'new-field'}
          field={editingField ?? undefined}
          onSave={handleSaveField}
          onCancel={() => {
            setEditingField(null);
            setIsAdding(false);
          }}
          existingFields={fields} // REQUIRED prop for FieldEditor
        />
      )}

      {fields.length === 0 ? (
        <Paper style={{ padding: '16px', textAlign: 'center' }}>
          <Typography>No fields added yet</Typography>
        </Paper>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="fields">
            {(dropProvided) => (
              <List {...dropProvided.droppableProps} ref={dropProvided.innerRef}>
                {fields.map((field, index) => (
                  <Draggable key={field.id} draggableId={field.id} index={index}>
                    {(dragProvided) => (
                      <ListItem
                        component="li"
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        secondaryAction={
                          <Box>
                            <IconButton aria-label="edit" onClick={() => setEditingField(field)}>
                              <Edit />
                            </IconButton>
                            <IconButton
                              aria-label="delete"
                              onClick={() => handleDeleteField(field.id)}
                              edge="end"
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        }
                        style={{
                          ...(dragProvided.draggableProps.style as React.CSSProperties),
                          marginBottom: '8px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: 4,
                        }}
                      >
                        <div
                          {...dragProvided.dragHandleProps}
                          style={{ marginRight: 8, display: 'flex', alignItems: 'center' }}
                          aria-label="drag handle"
                        >
                          <DragHandle />
                        </div>
                        <ListItemText
                          primary={field.label || 'Untitled Field'}
                          secondary={`Type: ${field.type} | ${field.required ? 'Required' : 'Optional'}`}
                        />
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {dropProvided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default FieldList;
