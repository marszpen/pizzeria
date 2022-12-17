import {select, classNames, templates} from './settings.js';
import utils from './usils.js';
import AmountWidget from './components/AmountWidget.js';

class Product { //jak dodać debugger?
    constructor (id, data) {//2. nazwanie argumentów. które otrzymuje konstruktor
      const thisProduct = this;

      thisProduct.id = id;// zapisanie wartości argumentów do właściwości funkcji
      thisProduct.data = data;//j.w.

      thisProduct.renderInMenu();//uruchomienie funkcji tuż po utworzeniu instancji
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      console.log('new Product:', thisProduct);
    }
      
    renderInMenu(){
      const thisProduct = this;//renderowanie produktów na stronie

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //console.log(this);
      /* create element using utils.createElementFromHTML -tworzenie lementu DOM*/ 
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);

    }

    getElements(){
      const thisProduct = this;
      
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion (){
      const thisProduct = this;
      /* find the clickable trigger (the element that should react to clicking) */
      /* const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); - wywołana w getElements*/
        
      /* START: add event listener to clickable trigger on event click */
      /*clickableTrigger.addEventListener('click', function(event) { - zamiana na poniższe przy dodaniu getElements*/
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);//'.active').innerHTML; //czy tak też mogę? zastosować 'active' i .innetHTML?
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct != thisProduct.element && activeProduct !== null) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }       
        /*const activeProduct = activeProduct.classList.contains(classNames.menuProduct.wrapperActive);
        console.log(active);
        if (activeProduct && activeProduct !== thisProduct.element){
          activeProduct.classList.remove('active');
        }*/

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        /*thisProduct.element.classList.toggle('active');
        return (event);*/
      });

    }

    initOrderForm(){
      const thisProduct = this;
      //console.log('initOrderForm');
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
        
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
        
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
      
    processOrder(){
      const thisProduct = this;
      //console.log('processOrder');

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // for every option in this category
        for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          // console.log(optionId, option);
          //check if formData and paramId has optionId
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId); //wcześniej if(formData[paramId] && formData[paramId].includes(option)) const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if(optionSelected){
          // check if the option is not default
            if(!option.default) {
              // add option price to price variable
              price += option.price;
            }
            // check if formData is default
          } else {
            if(option.defalut) {
              // reduce price variable 
              price -= option.price;
            }
          }
          // find image class .paramId-optionId in HTML
          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          // const optionSelected = formData[paramId] && formData[paramId].includes(optionId); 
          if(optionImage) {
            if(optionSelected) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      thisProduct.priceSingle = price;
      /* multiply price by amount */
      price *= thisProduct.amountWidget.value;
      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    
    }

    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget (thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function() {
      
        thisProduct.processOrder();
      });
    }

    prepareCartProduct(){
      const thisProduct = this;
      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.amountWidget.value * thisProduct.priceSingle,
        params: thisProduct.prepareCartProductParams(),
      };
      return(productSummary);
    }

    addToCart(){
      const thisProduct = this;

     // app.cart.add(thisProduct.prepareCartProduct());

     const event = new CustomEvent('add-to-cart', {
        bubbles: true,
        detail: {
            product: thisProduct,
        }
     }); //custom event już wbudowany w js

     thisProduct.element.dispatchEvent(event); //wywołanienie na elemencie produktu
    }

    prepareCartProductParams(){
      const thisProduct = this;
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      const params = {};

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);
        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        };
        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          // console.log(optionId, option);
          //check if formData and paramId has optionId
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId); //wcześniej if(formData[paramId] && formData[paramId].includes(option)) const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if(optionSelected){
            params[paramId].options[optionId] = option.label;
            console.log(option.label);
          }
        }
      }
      return params;
    }
  }

  export default Product;

  