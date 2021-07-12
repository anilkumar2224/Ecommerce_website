import React from "react";
import { Label } from "admin-bro";

const imgStyle = {
  width: "10em",
  borderRadius: "11px",
  margin: "1em auto",
  padding:"5px"
};

const AdminShowBrandImage = (props) => {
  const { record, property } = props;

  
  return (
    <div>
      <Label>Brand Images</Label>
     {Object.keys(record.params).map(data=>{
       if(data.includes("brands Brand Img")){
         return <img style={imgStyle} src={record.params[data] } alt="Brand Image" />;
       }
     })}
     
     
    </div>
  
  );
};

export default AdminShowBrandImage;
