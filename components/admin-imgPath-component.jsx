import React from "react";
import { Label } from "admin-bro";

const imgStyle = {
  width: "30em",
  borderRadius: "11px",
  margin: "1em auto",
  padding: "5px",
};

const AdminShowImage = (props) => {
  const { record, property } = props;

  return (
    <div>
      <Label>Product Image</Label>
      {Object.keys(record.params).map((data) => {
        if (data.includes("imagePath")) {
          return (
            <img
              style={imgStyle}
              src={record.params[data]}
              alt="Product Image"
            />
          );
        }
      })}
    </div>
  );
};

export default AdminShowImage;
