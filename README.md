
# jQuery Form Dependencies

This jQuery plugin allows you to easily set up dependency rules between form elements through the HTML markup. Original idea from [Twey's Form Manager script](http://www.dynamicdrive.com/dynamicindex16/formdependency.htm).

## Examples

A complex demo can be seen [**here**](http://dev.digitalnature.eu/javascript/jQuery-Form-Dependencies/)

Basic example:

    <form>
      <input type="checkbox" name="somecheckbox" />
      <input type="text" data-depends-on="somecheckbox" />
    </form>

Javascript:

    $('form').FormDependencies();

## Syntax

    [!]name[:value[|value2][...]] [+ [!]name[:value[|value2][,][...]]] [...]

The `+` operator is used to delimit multiple conditions:

    input1 + input2 + input3:value

The `!` operator negates a condition:

    !checkbox


Colons (`:`) can be used to specify the value to match:

    textinput:foo

Commas (`,`) to match multiple values (AND):

    selectinput:foo,bar

Vertical bar (`|`) to match at least one value (OR):

    selectinput:foo|bar



## Note

The current implementation is quite slow. A page containing 40-50 dependency rules can freeze the page during loading for 1-2s. Any suggestions on improving script performance are welcome