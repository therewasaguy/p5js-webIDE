ace.define("ace/theme/p5-light",["require","exports","module","ace/lib/dom"], function(acequire, exports, module) {

var varGold = '#b48318';
// var blueish = '#2d7BB6';
var greenish = '#15cc35';
var blueish = '#4a90e2';
var mainFont = '#333';
var pinkish = '#ec345e';
var pinkishKeyword = '#f10046';
// var turqoisish = '#346E7D';
var turqoisish = '#346E7D'; //#4a90e2';
var greyish = '#b1b1b1';
var selectionColor = 'rgba(21,204,54,0.1)';
var offWhite = '#e8e8e8';


exports.isDark = false;
exports.cssClass = "p5-light";
exports.cssText = ".p5-light .ace_gutter {\
background: #FDFDFD;\
color: #333;\
}\
.p5-light .ace_print-margin {\
}\
.p5-light {\
background-color: #fff;\
color: "+mainFont+"\
}\
.p5-light .ace_cursor {\
color: "+mainFont+"\
}\
.p5-light .ace_marker-layer .ace_selection {\
background: "+selectionColor+";\
}\
.p5-light.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #FFFFFF;\
border-radius: 2px\
}\
.p5-light .ace_marker-layer .ace_step {\
background: rgb(255, 255, 0)\
}\
.p5-light .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid #BFBFBF\
}\
.p5-light .ace_marker-layer .ace_active-line {\
background: rgba(207,207,207,0.07);\
}\
.p5-light .ace_gutter-active-line {\
background-color: rgba(207,207,207,0.20);\
}\
.p5-light .ace_marker-layer .ace_selected-word {\
border: 1px solid #BDD5FC\
}\
.p5-light .ace_invisible {\
color: #BFBFBF\
}\
.p5-light .ace_keyword,\
.p5-light .ace_meta,\
.p5-light .ace_support.ace_constant.ace_property-value {\
color: "+pinkishKeyword+";\
}\
.p5-light .ace_keyword.ace_operator {\
	color: "+mainFont+";\
}\
.p5-light .ace_support.ace_constant {\
	color:"+turqoisish+";\
}\
.p5-light .ace_keyword.ace_other.ace_unit {\
	color: #96DC5F\
}\
.p5-light .ace_constant.ace_language {\
	color:"+pinkish+";\
}\
.p5-light .ace_variable.ace_language {\
	color:"+blueish+";\
}\
.p5-light .ace_variable.ace_parameter {\
	color: "+turqoisish+";\
}\
.p5-light .ace_constant.ace_numeric {\
color: "+pinkish+";\
}\
.p5-light .ace_constant.ace_character.ace_entity {\
color: #BF78CC\
}\
.p5-light .ace_invalid {\
background-color: #FF002A\
}\
.p5-light .ace_fold {\
background-color: #AF956F;\
border-color: #000000;\
}\
.p5-light .ace_storage {\
color: " + varGold +";\
}\
.p5-light .ace_support.ace_class,\
.p5-light .ace_support.ace_function,\
.p5-light .ace_support.ace_other,\
.p5-light .ace_support.ace_type {\
color: "+blueish+"\
}\
.p5-light .ace_string {\
color: "+offWhite+";\
}\
.p5-light .ace_comment {\
color: "+greyish+"\
}\
.p5-light .ace_entity.ace_name.ace_function{\
color: "+blueish+";\
}\
.p5-light .ace_entity.ace_name.ace_tag,\
.p5-light .ace_entity.ace_other.ace_attribute-name {\
color: #606060\
}\
.p5-light .ace_indent-guide {\
background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWPQ0FD0ZXBzd/wPAAjVAoxeSgNeAAAAAElFTkSuQmCC) right repeat-y;\
}";

var dom = acequire("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
