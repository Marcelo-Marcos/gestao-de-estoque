/**
 * Checagem de CSS.
 *
 * Existe por uma regra só, mas a mais fácil de furar sem perceber: nenhum CSS
 * de componente escreve cor. Tudo sai dos tokens, para trocar a identidade
 * visual ser trocar valores em um arquivo (ver CLAUDE.md).
 */
export default {
  rules: {
    // #fff, #ffb3b5, #ffffff80 — qualquer notação hexadecimal.
    'color-no-hex': [true, { message: 'Cor precisa vir de um token de src/styles/tokens.css (ver CLAUDE.md). Se falta um token, crie o token.' }],

    // rgb(), hsl(), oklch() e afins escapariam da regra acima.
    'function-disallowed-list': [
      ['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'color'],
      { message: 'Cor precisa vir de um token de src/styles/tokens.css (ver CLAUDE.md). Se falta um token, crie o token.' },
    ],

    // Nomes de cor (red, white) também são cor escrita à mão.
    'declaration-property-value-disallowed-list': [
      {
        '/^(color|background|background-color|border|border-color|fill|stroke|outline-color|box-shadow|text-shadow)$/':
          ['/^(?!.*var\\()(black|white|red|green|blue|yellow|orange|purple|gray|grey|silver|transparent\\s+\\w)/i'],
      },
      { message: 'Cor precisa vir de um token de src/styles/tokens.css (ver CLAUDE.md).' },
    ],
  },

  overrides: [
    {
      // Os tokens são justamente onde as cores são definidas.
      files: ['src/styles/tokens.css'],
      rules: {
        'color-no-hex': null,
        'function-disallowed-list': null,
        'declaration-property-value-disallowed-list': null,
      },
    },
  ],
}
