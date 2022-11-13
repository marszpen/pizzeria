/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor (id, data) {//2. nazwanie argumentów. które otrzymuje konstruktor
      const thisProduct = this;

      thisProduct.id = id;// zapisanie wartości argumentów do właściwości funkcji
      thisProduct.data = data;//j.w.

      thisProduct.renderInMenu();//uruchomienie funkcji tuż po utworzeniu instancji
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.processOrder();
      console.log('new Product:', thisProduct);
    }

      renderInMenu() {
        const thisProduct = this;//renderowanie produktów na stronie

        /* generate HTML based on template */
        const generatedHTML = templates.menuProduct(thisProduct.data);
        console.log(this);
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
        console.log('initOrderForm');
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
          
        });
      }
      
      
      processOrder(){
        const thisProduct = this;
        console.log('processOrder');
      }

  }

  const app = {
    initMenu: function(){
      const thisApp = this; 
      console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){ //1. przekazanie argumentów konstruktorowi
        new Product (productData, thisApp.data.products[productData]);
    }
  },

  initData: function(){
    const thisApp = this;

    thisApp.data = dataSource;
  },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
    

      thisApp.initData();
      thisApp.initMenu();
    }
  }
  app.init()
}


