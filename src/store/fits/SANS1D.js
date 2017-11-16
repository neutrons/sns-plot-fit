export default {
    'None': {
      fit: 'None',
      equation: '',
      transformations: {
        x: 'x',
        y: 'y',
        e: 'e',
      },
      yLabel: "I",
      xLabel: "Q",
      note: ""
    },
    'Linear': {
      fit: 'Linear',
      equation: 'm*x+b',
      transformations: {
        x: 'x',
        y: 'y',
        e: 'e',
      },
      yLabel: "I",
      xLabel: "Q",
      note: ""
    },
    'Guinier': {
      fit: 'Guinier',
      equation: "-Rg^2/3*x+I0",
      transformations: {
        x: 'x^2',
        y: 'log(y)',
        e: '((1/y)*e)^2',
      },
      yLabel: "Log(I(q))",
      xLabel: "q^2",
      note: ""
    },
    // 'Low-Q Guinier': {
    //   fit: 'Low-Q Guinier',
    //   equation: "-(L^2/12+Rg^2/2)/3*x+I0",
    //   yTransformation: "log(y)",
    //   xTransformation: "x^2",
    //   eTransformation: "((1/y)*e)^2",
    //   yLabel: "Log(I(q))",
    //   xLabel: "q^2",
    //   note: "Cylinder of length L and Radius R"
    // },
    // 'Intermediate-Q Guinier': {
    //   fit: 'Intermediate-Q Guinier',
    //   equation: "-(Rg^2/2)/3*x+I0/x",
    //   yTransformation: "log(x*y)",
    //   xTransformation: "x^2",
    //   eTransformation: "((1/y)*e)^2",
    //   yLabel: "Log(q*I(q))",
    //   xLabel: "q^2",
    //   note: "Radius R"
    // },
    // 'Flat Object Guinier': {
    //   fit: 'Flat Object Guinier',
    //   equation: "-(T^2/12)/3*x+I0/x^2",
    //   yTransformation: "log(x^2*y)",
    //   xTransformation: "x^2",
    //   eTransformation: "((1/y)*e)^2",
    //   yLabel: "Log(q^2*I(q))",
    //   xLabel: "q^2",
    //   note: "T is the thickness of a flat (lamella) object."
    // },
    'Porod': {
      fit: 'Porod',
      equation: "p0*x^(-p1)",
      transformations: {
        x: 'x',
        y: 'y',
        e: 'e',
      },
      yLabel: "I(q)",
      xLabel: "q",
      note: "This is valid for high Q."
    },
    'Zimm': {
      fit: 'Zimm',
      equation: "1/I0+Cl^2/I0*x",
      transformations: {
        x: 'x^2',
        y: '1/y',
        e: '((-1/y^2)*e)^2',
      },
      yLabel: "1/I(q)",
      xLabel: "q^2",
      note: ""
    },
    'Kratky': {
      fit: 'Kratky',
      equation: "m*x+b",
      transformations: {
        x: 'x',
        y: 'x^2*log(y)',
        // because there's no error for X I'm doing e(x) = 0.1
        // e(x) = sqrt(x) is annoying for high x
        e: '(x^2/y * e)^2 + (2*x*log(y) * 0.1)^2',
      },
      yLabel: "q^2 \times log(I)",
      xLabel: "q",
      note: ""
    },
    'Debye Beuche': {
      fit: 'Debye Beuche',
      equation: "m*x+I0",
      transformations: {
        x: 'x^2',
        y: 'sqrt(y)',
        e: '(1/(2*sqrt(y))*e)^2',
      },
      yLabel: "sqrt(I)",
      xLabel: "Q^2",
      note: ""
    },
  }