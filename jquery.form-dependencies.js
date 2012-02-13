/*

 jQuery Form Dependencies v1.3
   by digitalnature

     http://digitalnature.eu
     http://github.com/digitalnature/Form-Dependencies

     Demo: http://dev.digitalnature.eu/jquery/form-dependencies/



   This is an improved jQuery port of the Form Manager script by Twey:

      http://www.twey.co.uk/
      http://www.dynamicdrive.com/dynamicindex16/formdependency.htm

      Form Manager: A simple method of constructing complex dynamic forms.
      Written by Twey, http://www.twey.co.uk/.
      Use, copying, and modification allowed, so long as credit
      remains intact, under the terms of the GNU General Public License,
      version 2 or later. See http://www.gnu.org/copyleft/gpl.html for details.



  Usage examples:

    $('form').FormDependencies();
    $('#some_div').FormDependencies({attribute:'data-rules', disable_only:false, clear_inactive:true});



  Change log:

    13 feb. 2012, v1.3  - slightly improved performance (rules are parsed once, and only dependencies are now iterated during checks)
                        - changed target selector to match the container of the input fields, instead of the input fields directly
                        - added repo to github (first public release)

    23 jun. 2011, v1.2  - Fixed a problem in the value matching function

    21 jun. 2011, v1.1  - Added disable_only / clear_inactive options

    20 jun. 2011, v1.0  - First release

*/

(function($){
$.fn.FormDependencies = function(opts){

  var defaults = {
        attribute              : 'rules',           // the attribute which contains the rules (use 'data-rules' for w3c-valid HTML5 code)
        disable_only           : true,              // if true it will disable fields + label, otherwise it will also hide them
        clear_inactive         : false,             // clears input values from hidden/disabled fields
        identify_by            : 'name',            // attribute used to identify dependencies (ie. DEPENDS ON [identify_by] BEING ...)

        condition_separator    : ' AND ',           // rules...
        possibility_separator  : ' OR ',
        name_value_separator   : ' BEING ',
        depends                : 'DEPENDS ON ',
        conflicts              : 'CONFLICTS WITH ',
        empty                  : 'EMPTY'
      },

      opts = $.extend(defaults, opts),

      valueMatches = function(e, v){
        if(v === opts.empty) v = '';
        return (e.val() == v || (e.is(':radio') && e.filter(':checked').val() == v));
      };


  return this.each(function(){

    var inputs = $('input, select, textarea', this),

        // parse rules
        dependencies = inputs.filter(function(index){

          var j, k, f, n, rules = $(this).attr(opts.attribute), deps = {}, conflicts = {};

          if(!rules)
            return false;

          for(j = 0, f = rules.split(opts.condition_separator); j < f.length; ++j){
            if(f[j].indexOf(opts.depends) === 0){
              for(k = 0, g = f[j].substr(opts.depends.length).split(opts.possibility_separator); k < g.length; ++k){
                n = g[k].split(opts.name_value_separator);

                if(!deps[n[0]])
                  deps[n[0]] = [];

                g[k].indexOf(opts.name_value_separator) === -1 ?  deps[n[0]].push('') : deps[n[0]].push(n[1]);
              }

            }else if(f[j].indexOf(opts.conflicts) === 0){
              n = f[j].substr(opts.conflicts.length).split(opts.name_value_separator);

              if(!conflicts[n[0]])
                conflicts[n[0]] = [];

              f[j].indexOf(opts.name_value_separator) === -1 ? conflicts[n[0]].push('') : conflicts[n[0]].push(n[1]);
            };
          }

          $(this).data('deps', deps).data('conflicts', conflicts);

          return true;

        });

    // do the checks on input change
    inputs.bind('change input', function(){

      dependencies.each(function(){

        var hide = false, deps = $(this).data('deps'), conflicts = $(this).data('conflicts');

        $.each(deps, function(name, items){
          var match = inputs.filter('[' + opts.identify_by + '="' + name + '"]');

          for(var i = 0; i < items.length; i++){
            if((items[i] && !valueMatches(match, items[i])) || (!items[i] && !match.is(':checked'))){
              hide = true;
              break;
            }
          }

        });

        if(!hide){
          $.each(conflicts, function(name, items){
            var match = inputs.filter('[' + opts.identify_by + '="' + name + '"]');

            for(var i = 0; i < items.length; i++){
              if((items[i] && valueMatches(match, items[i])) || (!items[i]  && match.is(':checked'))){
                hide = true;
                break;
              }

            }

          });
        }

        // hide / disable
        if(hide && !$(this).is(':disabled')){
          this.disabled = true;
          $('label[for="' + this.id + '"]').addClass('disabled');

          if(!opts.disable_only){
            $(this).hide();
            $('label[for="' + this.id + '"]').hide();
          }

          // ignore submit buttons
          if(opts.clear_inactive && !$(this).is(':submit'))
            if($(this).is(':checkbox,:radio')) this.checked = false; else if(!$(this).is('select')) $(this).val('');


        // show / enable
        }else if(!hide && $(this).is(':disabled')){
          this.disabled = false;
          $('label[for="' + this.id + '"]').removeClass('disabled');

          if(!opts.disable_only){
            $(this).show();
            $('label[for="' + this.id + '"]').show();
          }

        }

      });

    });

    inputs.change();

  });

};

})(jQuery);
