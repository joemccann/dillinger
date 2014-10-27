ace.define("ace/theme/dillinger",["require","exports","module","ace/lib/dom"], function(acequire, exports, module) {

exports.isDark = false;
exports.cssClass = "ace-dillinger";
exports.cssText = ".ace-dillinger .ace_gutter {\
background: #F5F7FA;\
color: #A0AABF;\
overflow : hidden;\
border-right: 1px solid #D3DAEA;\
}\
.ace-dillinger .ace_print-margin {\
width: 1px;\
background: #e8e8e8;\
}\
.ace-dillinger .ace_strong,\
.ace-dillinger .ace_constant,\
.ace-dillinger .ace_heading {\
font-weight: 600;\
}\
.ace-dillinger .ace_markup.ace_heading {\
font-weight: 400;\
}\
.ace-dillinger .ace_emphasis,\
.ace-dillinger .ace_list {\
font-style: italic;\
}\
.ace-dillinger .ace_markup.ace_list {\
font-style: normal;\
}\
.ace-dillinger {\
background-color: #FFFFFF;\
color: black;\
}\
.ace-dillinger .ace_cursor {\
color: black;\
}\
.ace-dillinger .ace_invisible {\
color: rgb(191, 191, 191);\
}\
.ace-dillinger .ace_constant.ace_buildin {\
color: rgb(88, 72, 246);\
}\
.ace-dillinger .ace_constant.ace_language {\
color: rgb(88, 92, 246);\
}\
.ace-dillinger .ace_constant.ace_library {\
color: rgb(6, 150, 14);\
}\
.ace-dillinger .ace_invalid {\
background-color: rgb(153, 0, 0);\
color: white;\
}\
.ace-dillinger .ace_fold {\
}\
.ace-dillinger .ace_support.ace_function {\
color: rgb(60, 76, 114);\
}\
.ace-dillinger .ace_support.ace_constant {\
color: rgb(6, 150, 14);\
}\
.ace-dillinger .ace_support.ace_type,\
.ace-dillinger .ace_support.ace_class\
.ace-dillinger .ace_support.ace_other {\
color: rgb(109, 121, 222);\
}\
.ace-dillinger .ace_variable.ace_parameter {\
font-style:italic;\
color:#FD971F;\
}\
.ace-dillinger .ace_keyword.ace_operator {\
color: rgb(104, 118, 135);\
}\
.ace-dillinger .ace_comment {\
color: #236e24;\
}\
.ace-dillinger .ace_comment.ace_doc {\
color: #236e24;\
}\
.ace-dillinger .ace_comment.ace_doc.ace_tag {\
color: #236e24;\
}\
.ace-dillinger .ace_constant.ace_numeric {\
color: rgb(0, 0, 205);\
}\
.ace-dillinger .ace_variable {\
color: rgb(49, 132, 149);\
}\
.ace-dillinger .ace_xml-pe {\
color: rgb(104, 104, 91);\
}\
.ace-dillinger .ace_entity.ace_name.ace_function {\
color: #0000A2;\
}\
.ace-dillinger .ace_heading {\
}\
.ace-dillinger .ace_marker-layer .ace_selection {\
background: rgb(181, 213, 255);\
}\
.ace-dillinger .ace_marker-layer .ace_step {\
background: rgb(252, 255, 0);\
}\
.ace-dillinger .ace_marker-layer .ace_stack {\
background: rgb(164, 229, 101);\
}\
.ace-dillinger .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid rgb(192, 192, 192);\
}\
.ace-dillinger .ace_marker-layer .ace_active-line {\
background: #F7FAFC;\
}\
.ace-dillinger .ace_gutter-active-line {\
background-color : #E0E5EC;\
}\
.ace-dillinger .ace_marker-layer .ace_selected-word {\
background: rgb(250, 250, 255);\
border: 1px solid rgb(200, 200, 250);\
}\
.ace-dillinger .ace_storage,\
.ace-dillinger .ace_keyword,\
.ace-dillinger .ace_meta.ace_tag {\
color: rgb(147, 15, 128);\
}\
.ace-dillinger .ace_string.ace_regex {\
color: rgb(255, 0, 0)\
}\
.ace-dillinger .ace_entity.ace_other.ace_attribute-name {\
color: #994409;\
}\
.ace-dillinger .ace_indent-guide {\
background: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bLly//BwAmVgd1/w11/gAAAABJRU5ErkJggg==\") right repeat-y;\
}\
";

var dom = acequire("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
