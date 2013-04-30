/*

 jQuery Form Dependencies v2.0
   http://github.com/digitalnature/Form-Dependencies
*/


(function($){
$.fn.FormDependencies = function(opts){

  var defaults = {

        // the attribute which contains the rules (you can use 'data-rules' for w3c-valid HTML5 code)
        ruleAttr        : 'data-depends-on',

        // if given, this class will be applied to disabled elements
        inactiveClass   : false,

        // clears input values from hidden/disabled fields
        clearValues     : false,

        // attribute used to identify dependencies, must be unique if other than "name"
        identifyBy      : 'name'
      },

      opts = $.extend(defaults, opts),

      // disable (and maybe hide) the hooked element
      disable = function(e){

        if(!$(e).is(':input') && !$(e).hasClass('disabled'))
          $(e).addClass('disabled');

        if(!e.disabled){
          e.disabled = true;
          $('label[for="' + e.id + '"]').addClass('disabled');

          if(opts.inactiveClass)
            $(e, 'label[for="' + e.id + '"]').addClass(opts.inactiveClass);

          // we don't want to "clear" submit buttons
          if(opts.clearValues && !$(e).is(':submit'))
            if($(e).is(':checkbox, :radio')) e.checked = false; else if(!$(e).is('select')) $(e).val('');

        }
      },

      // enable (and show?) the hooked element
      enable = function(e){

        if(!$(e).is(':input') && $(e).hasClass('disabled'))
          $(e).removeClass('disabled');

        if(e.disabled){
          e.disabled = false;
          $('label[for="' + e.id + '"]').removeClass('disabled');

          if(opts.inactiveClass || !$(e).is(':visible'))
            $(e, 'label[for="' + e.id + '"]').removeClass(opts.inactiveClass);

          //if(opts.clear_inactive && $(e).is(':checkbox, :radio')) e.checked = true;
        }

      },

      // verifies if conditions are met
      matches = function(key, values, block){

        var i, v, invert = false, e = $('[' + opts.identifyBy + '="' + key + '"]', block);

        e = e.is(':radio') ? e.filter(':checked') : e.filter('[type!="hidden"]')

        for(i = 0; i < values.length; i++){

          v = values[i];
          invert = false;

          if(v[0] === '!'){
            invert = true;
            v = v.substr(1);
          }

          if((e.val() == v) || (!v && e.is(':checked')) || ((e.is(':submit') || e.is(':button')) && !e.is(':disabled')))
            return !invert;
        }

        return invert;
      },

      split = function(str, chr){
        return $.map(str.split(chr), $.trim);
      };

  return this.each(function(){

    var block = this, rules = [], keys = [];

    // parse rules
    $('[' + opts.ruleAttr + ']', this).each(function(){
      var deps = $(this).attr(opts.ruleAttr), dep, values, parsedDeps = {}, i, invert;

      if(!deps)
        return this;

      deps = split(deps, '+');

      for(i = 0; i < deps.length; i++){

        dep = deps[i];
        invert = false;

        // reverse conditional check if the name starts with '!'
        // the rules should have any values specified in this case
        if(dep[0] === '!'){
          dep = dep.substr(1);
          invert = true;
        }

        dep = split(dep, ':');
        values = dep[1] || '';

        if(!values && invert)
          values = '!';

        parsedDeps[dep[0]] = split(values, '|');

        // store key inputs in a separate array
        $('[' + opts.identifyBy + '="' + dep[0] + '"]', block).filter('[type!="hidden"]').each(function(){
          ($.inArray(this, keys) !== -1) || keys.push(this);
          parsedDeps[dep[0]].target = this;
        });

      }

      rules.push({target: this, deps: parsedDeps});
    });

    if(!keys.length)
      return;

    // attach our state checking function on keys (ie. inputs on which other inputs depend on)
    $(keys).on('change.FormDependencies keyup', function(event){

      // iterate trough all rules
      $.each(rules, function(input, inputRules){

        var hideIt = false;

        $.each(inputRules.deps, function(key, values){

          // we check only if a condition fails,
          // in which case we know we need to hide the hooked element
          if(!matches(key, values, block)){
            hideIt = true;
            return false;
          }

        });

        hideIt ? disable(inputRules.target) : enable(inputRules.target);

      });

    }).trigger('change.FormDependencies');
   
    return this;
  });

};

})(jQuery);