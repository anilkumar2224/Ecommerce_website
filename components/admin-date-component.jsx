import { DatePicker, DatePickerProps } from '@admin-bro/design-system'
const Datepicker = ()=>{
    return (
        <Box width={1/2} height="300px">
          <DatePicker onChange={(date) => console.log(date)}/>
        </Box>
        )
}

export default Datepicker;
