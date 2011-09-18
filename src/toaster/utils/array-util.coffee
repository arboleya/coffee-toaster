class ArrayUtil
	@find:(source, search, by_property)->
		for j, i in source
			if j == search || j[by_property] == search
				return {item: j, index: i}
	
	@diff:(a, b, by_property)->
		diff = []
		
		for item in a
			search = if by_property? then item[by_property] else item
			if !ArrayUtil.has b, search, by_property
				diff.push {item:item, action:"deleted"}
		
		for item in b
			search = if by_property? then item[by_property] else item
			if !ArrayUtil.has a, search, by_property
				diff.push {item:item, action:"created"}
		
		diff
	
	@has:(source, search, by_property)->
		return ArrayUtil.find( source, search, by_property )?