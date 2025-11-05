# Math Formula Guide for Quiz Questions

## Overview
The quiz system supports LaTeX math formulas using mathpix-markdown-it renderer.

## Inline Math
Use single dollar signs `$...$` for inline math expressions:

**Examples:**
- `$x^2 + y^2 = z^2$` → Pythagorean theorem
- `$\frac{a}{b}$` → Fraction
- `$\sqrt{x}$` → Square root
- `$\alpha, \beta, \gamma$` → Greek letters

## Block Math
Use double dollar signs `$$...$$` for display equations (centered, larger):

**Examples:**
```
$$
E = mc^2
$$
```

```
$$
\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

## Common Math Symbols

### Operators
- `+, -, \times, \div` → Basic operations
- `\pm, \mp` → Plus/minus
- `\cdot` → Dot multiplication
- `\leq, \geq` → Less/greater than or equal
- `\neq` → Not equal

### Functions
- `\sin, \cos, \tan` → Trigonometric
- `\log, \ln` → Logarithms
- `\lim_{x \to \infty}` → Limits
- `\sum_{i=1}^{n}` → Summation
- `\int_{a}^{b}` → Integral

### Symbols
- `\alpha, \beta, \gamma, \theta, \pi` → Greek letters
- `\infty` → Infinity
- `\partial` → Partial derivative
- `\nabla` → Nabla/gradient
- `\approx` → Approximately equal

### Structures
- `\frac{numerator}{denominator}` → Fractions
- `\sqrt{x}` or `\sqrt[n]{x}` → Roots
- `x^{power}` → Superscript
- `x_{subscript}` → Subscript
- `\overline{x}` → Overline
- `\hat{x}` → Hat

## Examples for Quiz Questions

### Algebra Question
```
Solve for $x$ in the equation $2x + 5 = 13$
```

### Geometry Question
```
Calculate the area of a circle with radius $r = 5$ cm.
Use $\pi \approx 3.14$
```

### Calculus Question
```
Find the derivative of $f(x) = x^3 + 2x^2 - 5x + 1$

$$
\frac{d}{dx}f(x) = ?
$$
```

### Complex Equation
```
The quadratic formula is:

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

Use this to solve $x^2 + 5x + 6 = 0$
```

## Tips
1. Preview your questions before saving
2. Use `\text{...}` for text within math mode
3. Use `\\` for line breaks in block equations
4. Wrap complex expressions in curly braces `{}`
5. Test formulas in the preview pane

## References
- Full LaTeX guide: https://www.overleaf.com/learn/latex/Mathematical_expressions
- Mathpix documentation: https://mathpix.com/docs
