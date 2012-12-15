class Question

  ask:(question, format, fn)->
      stdin = process.stdin
      stdout = process.stdout
      
      
      stdout.write "#{question} "
      
      stdin.once( 'data', (data)=> 
        data = data.toString().trim()
        if format.test data
          fn data.trim()
        else
          msg = "#{'Invalid entry, it should match:'.red}"
          rule = "#{format.toString().cyan}"
          stdout.write "\t#{msg} #{rule}\n"
          @ask question, format, fn

      ).resume()