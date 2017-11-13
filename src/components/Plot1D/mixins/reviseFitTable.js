import * as d3 from 'd3';

export const reviseFitTable = {
    methods: {
        reviseFitTable(e, sdlength) {
            let vm = this;

            d3.select("td#fit-file").html("<b>File: </b>" + vm.plotParameters.fileToFit);
            d3.select("td#fit-type").html("<b>Fit Type:</b> " + vm.plotParameters.fitConfiguration.fit);
            d3.select("td#fit-points").html("<b>No. Points:</b> " + sdlength);
            d3.select("td#fit-range").html("<b>Fit Range:</b> (" + e[0].toExponential(2) + ", " + e[1].toExponential(2) + ")");
            d3.select("td#fit-error").html("<b>Fit Error:</b> " + vm.fitError.toExponential(2));
            
            d3.select("td#fit-coefficients").html(function() {
                let coeffString = "<ul>";
                for( let key in vm.coefficients) {
                    
                    if(vm.plotParameters.fitConfiguration.fit.toLowerCase().includes('guinier')) {
        
                        if(key === 'I0') {
                            let I0 = Math.exp(vm.coefficients[key]);
                        
                            coeffString += "<li>Real " + key + " = " + I0 + "</li>";
                            continue;
                        }
        
                        if(key === 'Rg') {
                            let RgX = vm.coefficients[key] * Math.sqrt(vm.scale.x.invert(vm.brushObj.brushSelection[1]));
                            coeffString += "<li>" + key + " = " + vm.coefficients[key].toFixed(3) + " | Rg * x_max = " + RgX.toFixed(3) + "</li>";
                            continue;
                        }
                    }
        
                    coeffString += "<li>" + key + " = " + vm.coefficients[key].toFixed(3) + "</li>";
                }
                coeffString += "</ul>";
                return coeffString;
            });
        }
    }
}