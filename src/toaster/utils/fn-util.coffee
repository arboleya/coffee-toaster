class FnUtil
  @proxy:(fn, params...)->
    ( inner_params... )->
      fn.apply null,  params.concat inner_params