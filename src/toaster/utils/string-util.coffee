class StringUtil

  @titleize:(str)->
    words = str.match /[a-z]+/gi
    words[index] = StringUtil.ucasef word for word, index in words
    words.join " "



  @ucasef:(str)->
    output = str.substr( 0, 1).toUpperCase()
    output += str.substr( 1 ).toLowerCase()