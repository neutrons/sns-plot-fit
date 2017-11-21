import math from 'mathjs';
import { eventBus } from '../../eventBus';

/*
    These mixins are to handle fit configurations that have an initial value as a function.
    The functions will need to be processed in mathjs and returned as a single number/float
    in order to be used in the levengerg-marquardt fitting function.
*/

export const fitInitialValues = {
    methods: {
        enterInitialValue(exp, key) {
            let result = '';

            try {
                // console.log(`Entered value '${exp}'`);
                let code = math.compile(exp);

                // First convert x,y fields to single arrays
                let obj = this.identifyFields();
                
                result = exp === '' ? 1 : code.eval(obj);
                
                // Catch that result is not an array for cases when user enters 'x+1'
                // Math.JS treats that as operating on an array, so there isn't a reduced value
                if (Array.isArray(result)) {
                    throw 'Function must return a single value, not an array.';
                } else {
                    this.currentConfiguration.settings.initialValues[key] = result;
                }
                
            } catch (error) {
                // If an error occurs when altering initial values send it to error function
                eventBus.$emit('error-message', error, 'danger');
            }
        },
        identifyFields() {
            let obj = {x:[], y:[]};

            this.selectedData.forEach( (d) => {
                if (d.filename === this.fileToFit) {
                    for (let key in this.field) {
                        obj[key] = d.dataTransformed.map((el) => { return el[this.field[key]]; });
                    }
                }
            })
            
            return obj;
        },
        prepConfiguration() {
            // function to calculate initial value functions if the fit settings include them
            for (let key in this.currentConfiguration.settings.initialValues) {
                if (typeof this.currentConfiguration.settings.initialValues[key] === 'string') {
                    this.enterInitialValue(this.currentConfiguration.settings.initialValues[key], key);
                }
            };

            return this.currentConfiguration;
        }
    }
}