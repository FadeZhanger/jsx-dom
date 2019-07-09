fs = require('fs-extra')
ts = require('rollup-typescript')
babel = require('@babel/core')
replace = require('rollup-plugin-replace')
prettier = require('rollup-plugin-prettier')
{ rollup } = require('rollup')

renderChunk = (code) ->
  transformed = babel.transform code,
    babelrc: false
    comments: true
    minified: false
    plugins: [
      'minify-constant-folding'
      'minify-guarded-expressions'
      'minify-dead-code-elimination'
    ]
  code: transformed.code
  map: transformed.map

build = (name, inject) ->
  try
    bundle = await rollup
      input: './src/index.ts'
      plugins: [
        ts(),
        replace(inject),
        { renderChunk },
        prettier(tabWidth: 2)
      ]
    await bundle.write(format: 'es', file: "#{name}.js")
  catch e
    console.trace()
    console.error(e)

task 'build-slim', 'Build jsx-dom without SVG', ->
  await build('index', __SVG__: false)

task 'build', 'Build everything', ->
  invoke('build-slim')

task 'clean', 'Remove built files', ->
  await fs.unlink('index.js')
