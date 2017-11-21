import * as d3 from 'd3';

export const reviseFitTable = {
    methods: {
        reviseFitTable(e, sdlength) {
            let vm = this;

            let table = d3.select('#fit-results-table-' + vm.ID);

            table.select('td.fit-file').html(`<b>File: </b> ${vm.plotParameters.fileToFit}`);
            table.select('td.fit-type').html(`<b>Fit Type:</b> ${vm.plotParameters.fitConfiguration.fit}`);
            table.select('td.fit-points').html(`<b>No. Points:</b> ${sdlength}`);
            table.select('td.fit-range').html(`<b>Fit Range:</b> (${e[0].toExponential(2)}, ${e[1].toExponential(2)})`);
            table.select('td.fit-error').html(`<b>Fit Error:</b> ${vm.fitError.toExponential(2)}`);

            table.select('li.fit-damping').html(`<b>Damping: </b> ${vm.plotParameters.fitConfiguration.settings.parameters.damping.value}`);
            table.select('li.fit-iterations').html(`<b>No. Iterations: </b> ${vm.plotParameters.fitConfiguration.settings.parameters.maxIterations.value}`);
            table.select('li.fit-tolerance').html(`<b>Error Tolerance: </b> ${vm.plotParameters.fitConfiguration.settings.parameters.errorTolerance.value}`);
            table.select('li.fit-gradient').html(`<b>Gradient Difference: </b> ${vm.plotParameters.fitConfiguration.settings.parameters.gradientDifference.value}`);
            table.select('.fit-note').html(vm.plotParameters.fitConfiguration.note);
            
            table.select('td.fit-coefficients').html(function() {
                let coeffString = '<ul>';
                
                for (let key in vm.coefficients) {
                    
                    if (vm.plotParameters.fitConfiguration.fit.toLowerCase().includes('guinier')) {
        
                        if (key === 'I0') {
                            let I0 = Math.exp(vm.coefficients[key]);
                        
                            coeffString += '<li>Real ' + key + ' = ' + I0 + '</li>';
                            continue;
                        }
        
                        if (key === 'Rg') {
                            let RgX = vm.coefficients[key] * Math.sqrt(vm.scale.x.invert(vm.brushObj.brushSelection[1]));
                            coeffString += `<li> ${key} = ${vm.coefficients[key].toFixed(3)} | Rg * x_max = ${RgX.toFixed(3)}</li>`;
                            continue;
                        }
                    }
        
                    coeffString += `<li> ${key} = ${vm.coefficients[key].toFixed(3)}</li>`;
                };

                coeffString += '</ul>';

                return coeffString;
            });
        }
    }
}