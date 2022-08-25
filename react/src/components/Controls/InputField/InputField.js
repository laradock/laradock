import React from "react";
import { TextField } from "@material-ui/core";

export const InputField = ({
  name,
  label,
  value,
  error,
  handleChange,
  helperText,
  isMultiline,
  isRequired
}) => {

  return (
    <TextField
      className="my-3"
      name={name}
      type="text"
      label={isRequired ? label+"*" : label}
      inputProps={{ maxLength: isMultiline ? 500 : 50 }}
      variant="outlined"
      fullWidth
      value={value}
      error={error}
      helperText={error && helperText}
      onChange={handleChange}
      multiline={isMultiline}
      rows={isMultiline ? 3 : 1}
    />
  );
};
