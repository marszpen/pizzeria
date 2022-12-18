class BaseWidget{
    constructor(wrappetElement, initialValue){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrappetElement;

    thisWidget.correctValue = initValue;
    }

    get value(){
        const thisWidget = this;
        
        return thisWidget.correctValue;
    }
    set value(value) {
        const thisWidget = this;
        const newValue = thisWidget.parseInt(value);
  
        /* TODO: Add validation */
        if (thisWidget.correctValue !== newValue && !isNaN(newValue) && thisWidget.isValid(newValue)) {
          thisWidget.correctValue = newValue;
          thisWidget.dom.input.value = thisWidget.correctValue;
          thisWidget.announce();
        }
        thisWidget.renderValue();
    }
    
    setValue(value){
        const thisWidget = this;

        thisWidget.value = value;
    }
    parseValue(value){
        return parseInt(value);
    }
  
    isValid(value){
        return !isNaN(value)
    }

    renderValue(){
        const thisWidget = this;
  
        thisWidget.dom.input.value = thisWidget.value;
    }

    announce(){
        const thisWidget = this;
  
        const event = new Event ('updated', {
          bubbles: true
        });
        thisWidget.element.dispatchEvent(event);
    }
  
}

export default BaseWidget;
