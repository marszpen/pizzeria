import {select} from './settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';


class Booking {
    constructor(element){
        const thisBooking = this;

        thisBooking.render(element);
        thisBooking.initWidgets();
    }

    render(element){
        const thisBooking = this;

        /* generate HTML based on template */
        const generatedHTML = templates.bookingWidget();

        const bookingContainer = document.querySelector(select.containerOf.booking);
        
        /* add element to menu */
        bookingContainer.appendChild(thisBooking.element).innerHTML;

        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;

        thisBooking.dom.hoursAmount = element.querySelector(
            select.booking.hoursAmount 
          );
        thisBooking.dom.peopleAmount = element.querySelector(
            select.booking.peopleAmount
          );

        thisBooking.dom.datePickerInput = element.querySelector(
          select.widgets.datePicker.wrapper
          );
        thisBooking.dom.hourPickerInput = element.querySelector(
          select.widgets.hourPicker.wrapper
          );
    }
    initWidget(){
      const thisBooking = this;
      thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
      thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
      thisBooking.dom.peopleAmount.addEventListener('updated', function() {
      });
      thisBooking.datePicker = new DatePicker(thisBooking.dom.datePickerInput);
      thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPickerInput);
      }
      
    }
}

export default Booking; 