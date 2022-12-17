import {select} from './settings.js';
import AmountWidget from './AmountWidget.js';

class Booking{
    constructor(element){
        const thisBooking = this;

        thisBooking.render();
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
    }
    initWidget(){
        
    }
}

export default Booking; 