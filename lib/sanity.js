var
v = require('validator');

function isPostIdFine(id){
    return (!v.isNull(id)) && v.isNumeric(id);
};

function isStringFine(comment){
    return (!v.isNull(comment)) &&
        v.isAlphanumeric(comment, 'pl-PL');
};

function doEscape(string){
    return v.escape(string);
};

function doUnEscape(string){
    return v.unescape(string);
};

module.exports = {
    isPostIdFine: isPostIdFine,
    isStringFine: isStringFine,
    doEscape: doEscape,
    doUnEscape: doUnEscape
};
