# Math Formula Support in Quizzes

## Overview

The quiz system now supports mathematical formulas using LaTeX syntax, powered by `mathpix-markdown-it`. You can write math expressions inline or as display equations directly in your quiz questions.

## Features

✅ **Real-time Preview** - See how your math formulas render as you type
✅ **LaTeX Support** - Full LaTeX math syntax support  
✅ **Inline & Display Math** - Both `$...$` and `$$...$$` syntax supported
✅ **Markdown Compatible** - Mix text, formatting, and math seamlessly
✅ **No Schema Changes** - Existing `question_text` field supports all features

## Quick Start

### Inline Math
Use single dollar signs for inline formulas:

```
What is the value of $x$ in the equation $x^2 + 5x + 6 = 0$?
```

### Display Math  
Use double dollar signs for centered display equations:

```
Solve the following equation:

$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

## Usage in Quiz Forms

### Adding Questions with Math

1. Navigate to **Teacher Dashboard → Quizzes → Add Quiz**
2. Add a new question
3. In the "Question" field, type your question with LaTeX math
4. The preview pane below will show how it renders
5. Use the helper text guide for syntax reference

### Example Questions

**Algebra:**
```
Find the roots of $2x^2 - 7x + 3 = 0$ using the quadratic formula.
```

**Calculus:**
```
Calculate the derivative:

$$
f(x) = 3x^4 - 2x^3 + x - 5
$$
```

**Geometry:**
```
Given a circle with radius $r = 10$ cm, calculate its area using $A = \pi r^2$
```

**Trigonometry:**
```
Simplify: $\sin^2(\theta) + \cos^2(\theta) = ?$
```

## Common Math Symbols

### Basic Operations
- `+`, `-`, `\times`, `\div` - Basic arithmetic
- `\pm`, `\mp` - Plus/minus
- `\cdot` - Dot multiplication
- `\frac{a}{b}` - Fractions
- `\sqrt{x}` or `\sqrt[n]{x}` - Roots

### Greek Letters
- `\alpha`, `\beta`, `\gamma`, `\delta`, `\theta`, `\pi`, `\sigma`
- Uppercase: `\Gamma`, `\Delta`, `\Theta`, `\Pi`, `\Sigma`

### Comparison
- `=`, `\neq` - Equal, not equal
- `<`, `>`, `\leq`, `\geq` - Less/greater than
- `\approx` - Approximately equal
- `\equiv` - Equivalent

### Advanced
- `\sum_{i=1}^{n}` - Summation
- `\int_{a}^{b}` - Integral
- `\lim_{x \to \infty}` - Limit
- `\frac{\partial}{\partial x}` - Partial derivative

### Functions
- `\sin`, `\cos`, `\tan`, `\log`, `\ln`, `\exp`

## Preview Component

The system includes a real-time preview component that shows:
- How math formulas will render
- Any formatting or syntax errors
- The final appearance for students

## Technical Details

### Dependencies
- `mathpix-markdown-it` - LaTeX math rendering engine
- Installed automatically via npm

### Components
- `MathPreview` - Real-time preview for quiz form
- `MathQuestionDisplay` - Renders questions for students

### Database
- No migration needed
- Existing `TEXT` field in `questions` table supports markdown
- Backward compatible with plain text questions

## Tips for Best Results

1. **Test in Preview** - Always check the preview pane before saving
2. **Use Curly Braces** - Wrap complex expressions: `x^{2y}` not `x^2y`
3. **Escape Special Characters** - Use `\_` for literal underscores
4. **Line Breaks** - Use `\\` for line breaks in display math
5. **Spacing** - LaTeX handles spacing automatically, no need for extra spaces
6. **Text in Math** - Use `\text{...}` for text within formulas

## Examples in Context

### Multiple Choice Question
```
Question: Calculate $\int_{0}^{1} x^2 dx$

Options:
- $\frac{1}{3}$
- $\frac{1}{2}$
- $1$
- $2$

Correct Answer: $\frac{1}{3}$
```

### Word Problem with Math
```
A projectile is launched with initial velocity $v_0 = 20$ m/s at an angle $\theta = 45°$.

Calculate the maximum height using:

$$
h_{max} = \frac{v_0^2 \sin^2(\theta)}{2g}
$$

where $g = 9.8$ m/s²
```

## Troubleshooting

### Formula Not Rendering
- Check that you used `$` for inline or `$$` for display
- Ensure all braces `{}` are balanced
- Look for syntax errors in the preview

### Preview Shows Error
- Review LaTeX syntax
- Check for special characters that need escaping
- Try simplifying the formula

### Styling Issues
- Formulas inherit from theme
- Display math is automatically centered
- Inline math flows with text

## Resources

- [Full LaTeX Guide](https://www.overleaf.com/learn/latex/Mathematical_expressions)
- [Mathpix Documentation](https://mathpix.com/docs)
- [Math Formula Guide](../MATH_FORMULA_GUIDE.md) - Detailed syntax reference

## Migration Notes

### Existing Quizzes
- All existing questions remain functional
- Plain text questions work as before
- No action required for existing content

### Adding Math to Existing Questions
1. Edit the quiz
2. Edit the question text
3. Add LaTeX math syntax
4. Preview and save

## Future Enhancements

Potential future improvements:
- Math formula autocomplete
- Visual equation editor
- Formula templates library
- Student answer validation with math parsing
