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
          initialValues: {
            x: 1,
            y: 1,
          },
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
          initialValues: {
              m: 1,
              b: 1,
          },
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
        equation: 'a*exp(-(x-x0)^2/(2*sigma^2))+c',
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
          initialValues: {
            a: 'max(y)',
            x0: 'mean(x)',
            sigma: 'sqrt(abs(sum((mean(x)^2*y))/sum(y)))',
            c: '-max(y)'
          },
        },
      },
};