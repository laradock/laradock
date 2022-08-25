import React from "react";
import Button from '@material-ui/core/Button';

export const Btn = ({text , handleClick}) => {
  return (
    <Button variant="contained" color="primary" onClick={handleClick}>
      {text}
    </Button>
  );
};
