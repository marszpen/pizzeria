import { templates, select } from '../settings.js';
import utils from '../utils.js';

class Home {
    construtor (){
        const thisHome = this;

        thisHome.getElements();
        thisHome.render();
        thisHome.initWidget();
    }

        getElements (element) {
            const thisHome = this;
            thisHome.dom = {};

            thisHome.dom.wrapper = element;
            thisHome.dom.homeHeader = document.querySelector(select.home.homeHeader);

        }

        render(){
            const thisHome = this;

            const generatedHTML = templates.homeWidget();
            thisHome.element = utils.createDOMFromHTML(generatedHTML);
            const homeContainer = document.querySelector(select.containerOf.home);
            homeContainer.appendChild(thisHome.element);
        }

        initWidget(){
            const thisHome = this;


        }
}

export default Home;
