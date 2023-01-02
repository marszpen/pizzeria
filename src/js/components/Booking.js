import {select, templates, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from '../components/AmountWidget.js';
import DatePicker from '../components/DatePicker.js';
import HourPicker from '../components/HourPicker.js';
import { forEachTrailingCommentRange } from 'typescript';
import { className } from 'postcss-selector-parser';


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
      const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.msaDate)

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

      const minDate = thisBooking.dataPicker.minDate;
      const maxDate = thisBooking.dataPicker.maxDate;

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

      thisBooking.date = thisBookin.datePicker.value;
      thisBooking.hour = utils.hourToNumber(thisBookin.hourPicker.value);
    
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
          if(!isNaN(tabledId)){
            tabledId = parseInt(tableId);
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

        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
          select.booking.tables);

        thisBooking.dom.floor = element.querySelector(
          select.booking.floor);

    

      }

    initWidget(){
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

      thisBooking.dom.floor.addEventListener('click', function (event) {
        thisBooking.initTables(event);
      });
    
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

    }

export default Booking; 