import {select, templates, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from '../components/AmountWidget.js';
import DatePicker from '../components/DatePicker.js';
import HourPicker from '../components/HourPicker.js';

class Booking {
    constructor(element){
        const thisBooking = this;
        thisBooking.chooseTable = [];

        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();
        thisBooking.initTables();
    }

    getData(){
      const thisBooking = this;

      const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate)
      const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate)

      const params = {
        booking: [
          startDateParam,
          endDateParam,
        ],
        eventsCurrent: [
          settings.db.notRepeatParam,
          startDateParam,
          endDateParam,
        ],
        eventRepeat: [
          settings.db.repeatParam,
          endDateParam,
        ],
      };

      //console.log('getData params', params)
      const urls = {
        booking:       settings.db.url + '/' + settings.db.bookings 
                                        + '?' + params.booking.join('&'),
        eventsCurrent: settings.db.url + '/' + settings.db.events 
                                        + '?' + params.booking.join('&'),
        eventsRepeat:  settings.db.url + '/' + settings.db.events
                                        + '?' + params.booking.join('&'),
      };

      Promise.all([
        fetch(urls.booking),
        fetch(urls.eventsCurrent), 
        fetch(urls.eventsRepeat), 

      ])
        .then(function(allResponses){
          const bookingResponse = allResponses[0];
          const eventsCurrent = allResponses[1];
          const eventsRepeat = allResponses[2];
          return Promise.all([
            bookingResponse.json(),
            eventsCurrent.json(),
            eventsRepeat.json(),
        ]);
      })
        .then(function([bookings, eventsCurrent, eventsRepeat]){
          // console.log(bookings);
          // console.log(eventsCurrent);
          // console.log(eventsRepeat);
          thisBooking.parseData(bookings,eventsCurrent,eventsRepeat);
        });
    }

    parseData(bookings,eventsCurrent,eventsRepeat){
      const thisBooking = this;

      thisBooking.booked = {};

      for(let item of bookings){
        thisBooking.makeBooked(item.date, item.hour, item.table)
      } 

      for(let item of eventsCurrent){
        thisBooking.makeBooked(item.date, item.hour, item.table)
      } 

      const minDate = thisBooking.datePicker.minDate;
      const maxDate = thisBooking.datePicker.maxDate;

      for(let item of eventsRepeat){
        if(item.reeat == 'daily'){
          for(let loodDate = minDate; loodDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
        thisBooking.makeBooked(utils.dateToStr(looDate), item.hour, item.duration, item.table)
          } 
        }
      }
        //console.log('thisBooking.booked',thisBooking.booked)
      
        thisBooking.updateDOM();
    }

    makeBooked(date, hour, duration, table){
      const thisBooking = this;

      if(typeof thisBooking.booked[date] == 'undefined'){
        thisBooking.booked[date] = {};
      }

      const startHour = utils.hourToNumber(hour);
    
      for(let hourBlock = startHour; hourBlock <startHour + duration; hourBlock += 0,5){
        //console.log('loop', index);

        if(typeof thisBooking.booked[date][startHour] == 'undefined'){
          thisBooking.booked[date][startHour] = [];
        }
        thisBooking.booked[date][hourBlock].push(table);

      }
    }

    updateDOM(){
      const thisBooking = this;

      thisBooking.date = thisBooking.datePicker.value;
      console.log(thisBooking.hourPicker.value);
      thisBooking.hour = thisBooking.hourPicker.value;
    
      let allAvailable = false;

      if(
        typeof thisBooking.booked[thisBooking.date] == 'undefined'
        ||
        typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ){
          allAvailable = true;
        }

        for(let table of thisBooking.dom.tables){
          let tableId = table.getAttribute(settings.booking.tableIdAttribute);
          if(!isNaN(tableId)){
            tableId = parseInt(tableId);
          }

          if(
            !allAvailable
            &&
            thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) 
          ){
            table.classList.add(classNames.booking.tableBooked);
            } else {
              table.classList.remove(classNames.booking.tableBooked);
            }
          }
    }
    
    render(element){
        const thisBooking = this;

        /* generate HTML based on template */
        const generatedHTML = templates.bookingWidget();

        /* add element to menu */
        element.innerHTML= generatedHTML;

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
        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
          select.booking.tables
          );
        thisBooking.dom.floor = element.querySelector(
          select.booking.floor
          );
        thisBooking.dom.duration = element.querySelector(
          select.booking.duration
          );
        thisBooking.dom.people = element.querySelector(
          select.booking.people
          );
        thisBooking.dom.phone = element.querySelector(
          select.booking.phone
          );
        thisBooking.dom.address = element.querySelector(
          select.booking.address
          );
        thisBooking.dom.submit = element.querySelector(
          select.booking.submit
          );
        thisBooking.dom.starters = element.querySelectorAll(
          select.booking.starters
          );

    

    }

    initWidgets(){
      const thisBooking = this;
      thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
      thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
      
      thisBooking.datePicker = new DatePicker(thisBooking.dom.datePickerInput);
      thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPickerInput);
      
      thisBooking.dom.wrapper.addEventListener('updated', function(event) {
      thisBooking.updateDOM();
      if (
        event.target == thisBooking.dom.hourPicker ||
        event.target == thisBooking.dom.datePicker ||
        event.target == thisBooking.dom.peopleAmount ||
        event.target == thisBooking.dom.hoursAmount
      ){
        
        thisBooking.selectedTable = {};
        for (let table of thisBooking.dom.tables){
          table.classList.remove('selected');
          }
        }
      });

      thisBooking.dom.floor.addEventListener('click', function (event){
        thisBooking.initTables(event);
      });

      thisBooking.dom.submit.addEventListener('click', function (event){  
      event.preventDefault();
      thisBooking.sendBooking();
    })
    
    }
    
    initTables(){
      const thisBooking = this;
      
      thisBooking.dom.floor.addEventListener('click', function(event){
        event.preventDefault();
  
        if(event.target.classList.contains('table')){
          
          if(!event.target.classList.contains(classNames.booking.tableBooked)){
  
            for(let table of thisBooking.dom.tables){
              if (table.classList.contains(classNames.booking.tableSelected) &&
              table !== event.target){
                table.classList.remove(classNames.booking.tableSelected);
              }
              if(event.target.classList.contains(classNames.booking.tableSelected)){
                event.target.classList.remove(classNames.booking.tableSelected);
              } else {
                event.target.classList.add(classNames.booking.tableSelected);
              } 
            }
          } else {
            alert('this table is already booked');
          } 
        }
      });
    }

    sendBooking(){
      const thisBooking = this;
  
      const url = settings.db.url + '/' + settings.db.bookings;
      
      const payload = {
        date: thisBooking.date,
        hour: utils.numberToHour(thisBooking.hourPicker.value),
        table: parseInt(tableId),
        duration: thisBooking.hoursAmount.value,
        ppl: thisBooking.peopleAmount.value,
        starters: [],
        phone: thisBooking.dom.phone.value,
        adress: thisBooking.dom.address.value,
      };
  
      for(let starter of thisBooking.dom.starters) {
        if(starter.checked){
          payload.starters.push(starter.value);
        }
      };
  
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
        
      fetch(url, options)
        .then(function (response) {
          return response.json();
        }).then(function (parsedResponse) {
          console.log('parsedResponse', parsedResponse);
          thisBooking.makeBooked(
            parsedResponse.date, 
            parsedResponse.hour, 
            parsedResponse.duration,
            parsedResponse.table
          );
          thisBooking.updateDOM();
        });
    }

    }

export default Booking; 