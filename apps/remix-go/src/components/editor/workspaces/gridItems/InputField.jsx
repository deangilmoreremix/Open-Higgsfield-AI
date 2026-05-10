import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { showError, showInfo } from '../../../../services/alertService';
import { required } from '../../../../lib/validators';

const InputField = ({ onSave, value: initialValue }) => {
  const [isNameEdit, setIsNameEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState(initialValue);

  const validateTitle = (val) => required()(val);

  const onFocusInputChange = () => {
    setIsNameEdit(true);
  };

  const onEditLeave = () => {
    setIsNameEdit(false);
    onUpdate();
  };

  const onKeyPress = (event) => {
    if (event.which === 13) {
      onUpdate();
    }
  };

  const onUpdate = async () => {
    if (isLoading) {
      return;
    }
    
    if (!validateTitle(value)) {
      if (value !== initialValue) {
        setIsLoading(true);
        try {
          const confirmMessage = `The new name '${value}' saved successfully.`;
          await onSave(value);
          showInfo(confirmMessage, 'Success');
        } catch (err) {
          setValue(initialValue);
          showError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      showError('This field cannot be empty.');
      setValue(initialValue);
    }
  };

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <p className="tile-head p-2">
      <input
        type="text"
        className={`border rounded px-2 py-1 w-full ${validateTitle(value) ? 'border-red-500' : 'border-gray-300'}`}
        onChange={handleChange}
        onFocus={onFocusInputChange}
        onBlur={onEditLeave}
        onKeyPress={onKeyPress}
        value={value}
      />
      {(isNameEdit || isLoading) && (
        <button
          className={`rename-button ml-2 text-blue-600 ${isLoading ? 'animate-spin' : ''}`}
          onClick={onUpdate}
        >
          ✓
        </button>
      )}
    </p>
  );
};

export default observer(InputField);
