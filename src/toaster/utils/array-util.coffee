class ArrayUtil
	@find:(source, search, by_property)->
		if by_property is null
			for v, k in source
				return {item: v, index: k} if v == search
		else
			by_property = [].concat by_property
			for v, k in source
				for p in by_property
					return {item: v, index: k} if search == v[p]
		return null
	
	@find_all:(source, search, by_property, regexp, unique)->
		_output = []
		_unique = {}

		if by_property is null

			for v, k in source
				if regexp
					item = {item: v, index: k} if search.test v
				else
					item = {item: v, index: k} if search == v
				
				_output.push item if item
		else
			
			by_property = [].concat by_property
			for v, k in source
				for p in by_property
					if regexp
						if search.test v[p]
							if unique && _unique[k]?
								item = {item: v, index: k}
							else if !unique
								item = {item: v, index: k}
					else
						if search == v[p]
							item = {item: v, index: k}
					
					if item
						_output.push _unique[k] = item
		
		return _output
	
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