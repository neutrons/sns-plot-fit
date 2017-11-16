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
        note: ""
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
        equation: 'a*exp(-1*((x-b)^2)/(2*c^2))',
        transformations: {
          x: 'x',
          y: 'y',
        },
        yLabel: "y",
        xLabel: "x",
        note: ""
      },
};