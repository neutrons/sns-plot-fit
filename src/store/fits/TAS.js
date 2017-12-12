export default {
    'None': {
        fit: 'None',
        equation: '',
        transformations: {
          x: 'x',
          y: 'y',
        },
        yLabel: "y",
        xLabel: "x",
        note: "",
        settings: {
          parameters: {
            damping: {
              value: 0.001,
              min: 0.001,
              max: 10,
              increment: 0.001,
            },
            gradientDifference: {
              value: 0.1,
              min: 0.1,
              max: 1,
              increment: 0.1,
            },
            maxIterations: {
              value: 100,
              min: 100,
              max: 10000,
              increment: 100,
            },
            errorTolerance: {
              value: 0.001,
              min: 0.001,
              max: 1,
              increment: 0.001,
            },
          },
          initialValues: [
            ['x', 1, false], // x
            ['y', 1, false], // y
          ],
        },
      },
      'Linear': {
        fit: 'Linear',
        equation: 'm*x+b',
        transformations: {
          x: 'x',
          y: 'y',
        },
        yLabel: "y",
        xLabel: "x",
        note: "",
        settings: {
          parameters: {
            damping: {
              value: 0.001,
              min: 0.001,
              max: 10,
              increment: 0.001,
            },
            gradientDifference: {
              value: 0.1,
              min: 0.1,
              max: 1,
              increment: 0.1,
            },
            maxIterations: {
              value: 100,
              min: 100,
              max: 10000,
              increment: 100,
            },
            errorTolerance: {
              value: 0.001,
              min: 0.001,
              max: 1,
              increment: 0.001,
            },
          },
          initialValues: [
            ['m', 1, false], //m
            ['b', 1, false], //b
          ]
        },
      },
    'Gaussian': {
      /*
      // Gaussian function:
      f(x) = a*exp(-(x-x0)**2/(2*sigma**2))+c

      //Initial guess
      n = len(x)
      mean = sum(x*y)/sum(y)
      sigma = sqrt(abs(sum((x-mean)**2*y)/sum(y)))
      a, x0, sigma, c = -max(y), mean, sigma, min(x)+((max(x)-min(x)))/2

      */
        fit: 'Gaussian',
        // equation: `A/(sqrt(2*${Math.PI})*W)*exp(-(x-C)^2/(2*W^2))`,
        equation: `A*exp(-4*${Math.log(2)}*(x-center)^2/fwhm^2)`,
        // equation: 'a*exp(-1*((x-b)^2)/(2*c^2))',
        transformations: {
          x: 'x',
          y: 'y',
        },
        yLabel: "y",
        xLabel: "x",
        note: "",
        settings: {
          parameters: {
            damping: {
              value: 0.001,
              min: 0.001,
              max: 10,
              increment: 0.001,
            },
            gradientDifference: {
              value: 0.1,
              min: 0.1,
              max: 1,
              increment: 0.1,
            },
            maxIterations: {
              value: 100,
              min: 100,
              max: 10000,
              increment: 100,
            },
            errorTolerance: {
              value: 0.001,
              min: 0.001,
              max: 1,
              increment: 0.001,
            },
          },
          // initialValues: [
          //   'max(y)', // A
          //   'sqrt(abs(sum((mean(x)^2*y))/sum(y)))', // W
          //   'mean(x)', // C
          //   'sqrt(abs(sum((mean(x)^2*y))/sum(y)))', // W

          // ],
          // initialValues: [
          //   ['A', `max(y)-min(y)`, false],
          //   ['center', `sum(x*y)/sum(y)`, false],
          //   ['fwhm', `sqrt(abs(sum((x-(sum(x*y)/sum(y)))^2*y)/sum(y)))*${Math.sqrt(8*Math.log(2))}`, false],
          // ],
          initialValues: [
            ['A', `max(y) - min(y)`, false],
            ['center', `sum(x*y)/sum(y)`, false],
            ['fwhm', `sqrt(abs( sum( (x-(sum(x*y)/sum(y))) * (x-(sum(x*y)/sum(y))) * y)/sum(y) )) * ${Math.sqrt(8*Math.log(2))}`, false],
          ],
          // initialValues: [
          //   ['A', 50000], // A
          //   ['W', 3], // W
          //   ['C', 21], // C
          //   ['W', 3], // W
          // ],
        },
      },
      'Lorentzian': {
          fit: 'Lorentzian',
          // equation: `A/(sqrt(2*${Math.PI})*W)*exp(-(x-C)^2/(2*W^2))`,
          equation: `A * ((fwhm/2) / ((x-center)^2 + (fwhm/2)^2))`,
          transformations: {
            x: 'x',
            y: 'y',
          },
          yLabel: "y",
          xLabel: "x",
          note: "",
          settings: {
            parameters: {
              damping: {
                value: 0.001,
                min: 0.001,
                max: 10,
                increment: 0.001,
              },
              gradientDifference: {
                value: 0.1,
                min: 0.1,
                max: 1,
                increment: 0.1,
              },
              maxIterations: {
                value: 100,
                min: 100,
                max: 10000,
                increment: 100,
              },
              errorTolerance: {
                value: 0.001,
                min: 0.001,
                max: 1,
                increment: 0.001,
              },
            },
            initialValues: [
              ['A', `max(y) - min(y)`, false],
              ['fwhm', `sqrt(abs( sum( (x-(sum(x*y)/sum(y))) * (x-(sum(x*y)/sum(y))) * y)/sum(y) )) * ${Math.sqrt(8*Math.log(2))}`, false],
              ['center', `sum(x*y)/sum(y)`, false],
              ['fwhm', `sqrt(abs( sum( (x-(sum(x*y)/sum(y))) * (x-(sum(x*y)/sum(y))) * y)/sum(y) )) * ${Math.sqrt(8*Math.log(2))}`, false],
            ],
          },
        },
};