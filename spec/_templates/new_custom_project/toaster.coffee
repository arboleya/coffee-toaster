# => SRC FOLDER
toast 'custom_src'

  # EXCLUDED FOLDERS (optional)
  # exclude: ['folder/to/exclude', 'another/folder/to/exclude', ... ]

  # => VENDORS (optional)
  # vendors: ['vendors/x.js', 'vendors/y.js', ... ]

  # => OPTIONS (optional, default values listed)
  # bare: false
  # packaging: true
  # expose: ''
  # minify: true

  # => HTTPFOLDER (optional), RELEASE / DEBUG (required)
  httpfolder: 'custom_js'
  release: 'custom_www/custom_js/custom_app.js'
  debug: 'custom_www/custom_js/custom_app-debug.js'