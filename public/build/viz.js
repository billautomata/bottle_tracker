(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//! moment.js
//! version : 2.15.2
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, function () { 'use strict';

    var hookCallback;

    function utils_hooks__hooks () {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback (callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
    }

    function isObject(input) {
        // IE8 will treat undefined and null as object if it wasn't for
        // input != null
        return input != null && Object.prototype.toString.call(input) === '[object Object]';
    }

    function isObjectEmpty(obj) {
        var k;
        for (k in obj) {
            // even if its not own property I'd still call it non-empty
            return false;
        }
        return true;
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function create_utc__createUTC (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty           : false,
            unusedTokens    : [],
            unusedInput     : [],
            overflow        : -2,
            charsLeftOver   : 0,
            nullInput       : false,
            invalidMonth    : null,
            invalidFormat   : false,
            userInvalidated : false,
            iso             : false,
            parsedDateParts : [],
            meridiem        : null
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function (fun) {
            var t = Object(this);
            var len = t.length >>> 0;

            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(this, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    function valid__isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            var parsedParts = some.call(flags.parsedDateParts, function (i) {
                return i != null;
            });
            var isNowValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated &&
                (!flags.meridiem || (flags.meridiem && parsedParts));

            if (m._strict) {
                isNowValid = isNowValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }

            if (Object.isFrozen == null || !Object.isFrozen(m)) {
                m._isValid = isNowValid;
            }
            else {
                return isNowValid;
            }
        }
        return m._isValid;
    }

    function valid__createInvalid (flags) {
        var m = create_utc__createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    function isUndefined(input) {
        return input === void 0;
    }

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    var momentProperties = utils_hooks__hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            utils_hooks__hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment (obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor (number) {
        if (number < 0) {
            // -0 -> 0
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function warn(msg) {
        if (utils_hooks__hooks.suppressDeprecationWarnings === false &&
                (typeof console !==  'undefined') && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (utils_hooks__hooks.deprecationHandler != null) {
                utils_hooks__hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                var args = [];
                var arg;
                for (var i = 0; i < arguments.length; i++) {
                    arg = '';
                    if (typeof arguments[i] === 'object') {
                        arg += '\n[' + i + '] ';
                        for (var key in arguments[0]) {
                            arg += key + ': ' + arguments[0][key] + ', ';
                        }
                        arg = arg.slice(0, -2); // Remove trailing comma and space
                    } else {
                        arg = arguments[i];
                    }
                    args.push(arg);
                }
                warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (utils_hooks__hooks.deprecationHandler != null) {
            utils_hooks__hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    utils_hooks__hooks.suppressDeprecationWarnings = false;
    utils_hooks__hooks.deprecationHandler = null;

    function isFunction(input) {
        return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
    }

    function locale_set__set (config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (isFunction(prop)) {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        this._config = config;
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _ordinalParseLenient.
        this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + (/\d{1,2}/).source);
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig), prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        for (prop in parentConfig) {
            if (hasOwnProp(parentConfig, prop) &&
                    !hasOwnProp(childConfig, prop) &&
                    isObject(parentConfig[prop])) {
                // make sure changes to properties don't modify parent config
                res[prop] = extend({}, res[prop]);
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }

    var keys;

    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function (obj) {
            var i, res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }

    var defaultCalendar = {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[Last] dddd [at] LT',
        sameElse : 'L'
    };

    function locale_calendar__calendar (key, mom, now) {
        var output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS  : 'h:mm:ss A',
        LT   : 'h:mm A',
        L    : 'MM/DD/YYYY',
        LL   : 'MMMM D, YYYY',
        LLL  : 'MMMM D, YYYY h:mm A',
        LLLL : 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat (key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate () {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultOrdinalParse = /\d{1,2}/;

    function ordinal (number) {
        return this._ordinal.replace('%d', number);
    }

    var defaultRelativeTime = {
        future : 'in %s',
        past   : '%s ago',
        s  : 'a few seconds',
        m  : 'a minute',
        mm : '%d minutes',
        h  : 'an hour',
        hh : '%d hours',
        d  : 'a day',
        dd : '%d days',
        M  : 'a month',
        MM : '%d months',
        y  : 'a year',
        yy : '%d years'
    };

    function relative__relativeTime (number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (isFunction(output)) ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture (diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    var aliases = {};

    function addUnitAlias (unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    var priorities = {};

    function addUnitPriority(unit, priority) {
        priorities[unit] = priority;
    }

    function getPrioritizedUnits(unitsObj) {
        var units = [];
        for (var u in unitsObj) {
            units.push({unit: u, priority: priorities[u]});
        }
        units.sort(function (a, b) {
            return a.priority - b.priority;
        });
        return units;
    }

    function makeGetSet (unit, keepTime) {
        return function (value) {
            if (value != null) {
                get_set__set(this, unit, value);
                utils_hooks__hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get_set__get(this, unit);
            }
        };
    }

    function get_set__get (mom, unit) {
        return mom.isValid() ?
            mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
    }

    function get_set__set (mom, unit, value) {
        if (mom.isValid()) {
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

    // MOMENTS

    function stringGet (units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units]();
        }
        return this;
    }


    function stringSet (units, value) {
        if (typeof units === 'object') {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units);
            for (var i = 0; i < prioritized.length; i++) {
                this[prioritized[i].unit](units[prioritized[i].unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken (token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '', i;
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1         = /\d/;            //       0 - 9
    var match2         = /\d\d/;          //      00 - 99
    var match3         = /\d{3}/;         //     000 - 999
    var match4         = /\d{4}/;         //    0000 - 9999
    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2      = /\d\d?/;         //       0 - 99
    var match3to4      = /\d\d\d\d?/;     //     999 - 9999
    var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    // includes scottish gaelic two word and hyphenated months
    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;


    var regexes = {};

    function addRegexToken (token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken (token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }));
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken (token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (typeof callback === 'number') {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken (token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    var WEEK = 7;
    var WEEKDAY = 8;

    var indexOf;

    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (o) {
            // I know
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PRIORITY

    addUnitPriority('month', 8);

    // PARSING

    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m, format) {
        if (!m) {
            return this._months;
        }
        return isArray(this._months) ? this._months[m.month()] :
            this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m, format) {
        if (!m) {
            return this._monthsShort;
        }
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
            this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    function units_month__handleStrictParse(monthName, format, strict) {
        var i, ii, mom, llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            // this is not used
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = create_utc__createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse (monthName, format, strict) {
        var i, mom, regex;

        if (this._monthsParseExact) {
            return units_month__handleStrictParse.call(this, monthName, format, strict);
        }

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        // TODO: add sorting
        // Sorting makes sure if one month (or abbr) is a prefix of another
        // see sorting in computeMonthsParse
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth (mom, value) {
        var dayOfMonth;

        if (!mom.isValid()) {
            // No op
            return mom;
        }

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (typeof value !== 'number') {
                    return mom;
                }
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth (value) {
        if (value != null) {
            setMonth(this, value);
            utils_hooks__hooks.updateOffset(this, true);
            return this;
        } else {
            return get_set__get(this, 'Month');
        }
    }

    function getDaysInMonth () {
        return daysInMonth(this.year(), this.month());
    }

    var defaultMonthsShortRegex = matchWord;
    function monthsShortRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict ?
                this._monthsShortStrictRegex : this._monthsShortRegex;
        }
    }

    var defaultMonthsRegex = matchWord;
    function monthsRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict ?
                this._monthsStrictRegex : this._monthsRegex;
        }
    }

    function computeMonthsParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
        }
        for (i = 0; i < 24; i++) {
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    }

    // FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? '' + y : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PRIORITIES

    addUnitPriority('year', 1);

    // PARSING

    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? utils_hooks__hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    utils_hooks__hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear () {
        return isLeapYear(this.year());
    }

    function createDate (y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
            date.setFullYear(y);
        }
        return date;
    }

    function createUTCDate (y) {
        var date = new Date(Date.UTC.apply(null, arguments));

        //the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,
            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear, resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek, resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

    // FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PRIORITIES

    addUnitPriority('week', 5);
    addUnitPriority('isoWeek', 5);

    // PARSING

    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // LOCALES

    function localeWeek (mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow : 0, // Sunday is the first day of the week.
        doy : 6  // The week that contains Jan 1st is the first week of the year.
    };

    function localeFirstDayOfWeek () {
        return this._week.dow;
    }

    function localeFirstDayOfYear () {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek (input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek (input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    // FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PRIORITY
    addUnitPriority('day', 11);
    addUnitPriority('weekday', 11);
    addUnitPriority('isoWeekday', 11);

    // PARSING

    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   function (isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd',   function (isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd',   function (isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    function parseIsoWeekday(input, locale) {
        if (typeof input === 'string') {
            return locale.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
    }

    // LOCALES

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m, format) {
        if (!m) {
            return this._weekdays;
        }
        return isArray(this._weekdays) ? this._weekdays[m.day()] :
            this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
        return (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
        return (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
    }

    function day_of_week__handleStrictParse(weekdayName, format, strict) {
        var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];

            for (i = 0; i < 7; ++i) {
                mom = create_utc__createUTC([2000, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse (weekdayName, format, strict) {
        var i, mom, regex;

        if (this._weekdaysParseExact) {
            return day_of_week__handleStrictParse.call(this, weekdayName, format, strict);
        }

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = create_utc__createUTC([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\.?') + '$', 'i');
                this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\.?') + '$', 'i');
                this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\.?') + '$', 'i');
            }
            if (!this._weekdaysParse[i]) {
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }

        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.

        if (input != null) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
            return this.day() || 7;
        }
    }

    var defaultWeekdaysRegex = matchWord;
    function weekdaysRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                this._weekdaysRegex = defaultWeekdaysRegex;
            }
            return this._weekdaysStrictRegex && isStrict ?
                this._weekdaysStrictRegex : this._weekdaysRegex;
        }
    }

    var defaultWeekdaysShortRegex = matchWord;
    function weekdaysShortRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
            }
            return this._weekdaysShortStrictRegex && isStrict ?
                this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
        }
    }

    var defaultWeekdaysMinRegex = matchWord;
    function weekdaysMinRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
            }
            return this._weekdaysMinStrictRegex && isStrict ?
                this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
        }
    }


    function computeWeekdaysParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom, minp, shortp, longp;
        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, 1]).day(i);
            minp = this.weekdaysMin(mom, '');
            shortp = this.weekdaysShort(mom, '');
            longp = this.weekdays(mom, '');
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        // Sorting makes sure if one weekday (or abbr) is a prefix of another it
        // will match the longer piece.
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 7; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;

        this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
        this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
    }

    // FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    function meridiem (token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PRIORITY
    addUnitPriority('hour', 13);

    // PARSING

    function matchMeridiem (isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    // LOCALES

    function localeIsPM (input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


    // MOMENTS

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);

    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        ordinalParse: defaultOrdinalParse,
        relativeTime: defaultRelativeTime,

        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,

        week: defaultLocaleWeek,

        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,

        meridiemParse: defaultLocaleMeridiemParse
    };

    // internal storage for locale config files
    var locales = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && (typeof module !== 'undefined') &&
                module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we
                // want to undo that for lazy loaded locales
                locale_locales__getSetGlobalLocale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function locale_locales__getSetGlobalLocale (key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = locale_locales__getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale (name, config) {
        if (config !== null) {
            var parentConfig = baseConfig;
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple('defineLocaleOverride',
                        'use moment.updateLocale(localeName, config) to change ' +
                        'an existing locale. moment.defineLocale(localeName, ' +
                        'config) should only be used for creating a new locale ' +
                        'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
                parentConfig = locales[name]._config;
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    parentConfig = locales[config.parentLocale]._config;
                } else {
                    // treat as if there is no base config
                    deprecateSimple('parentLocaleUndefined',
                            'specified parentLocale is not defined yet. See http://momentjs.com/guides/#/warnings/parent-locale/');
                }
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));

            // backwards compat for now: also set the locale
            locale_locales__getSetGlobalLocale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale, parentConfig = baseConfig;
            // MERGE
            if (locales[name] != null) {
                parentConfig = locales[name]._config;
            }
            config = mergeConfigs(parentConfig, config);
            locale = new Locale(config);
            locale.parentLocale = locales[name];
            locales[name] = locale;

            // backwards compat for now: also set the locale
            locale_locales__getSetGlobalLocale(name);
        } else {
            // pass null for config to unupdate, useful for tests
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    // returns locale data
    function locale_locales__getLocale (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    function locale_locales__listLocales() {
        return keys(locales);
    }

    function checkOverflow (m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/;
    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/;

    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
        ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
        ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
        ['YYYY-DDD', /\d{4}-\d{3}/],
        ['YYYY-MM', /\d{4}-\d\d/, false],
        ['YYYYYYMMDD', /[+-]\d{10}/],
        ['YYYYMMDD', /\d{8}/],
        // YYYYMM is NOT allowed by the standard
        ['GGGG[W]WWE', /\d{4}W\d{3}/],
        ['GGGG[W]WW', /\d{4}W\d{2}/, false],
        ['YYYYDDD', /\d{7}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
        ['HH:mm:ss', /\d\d:\d\d:\d\d/],
        ['HH:mm', /\d\d:\d\d/],
        ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
        ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
        ['HHmmss', /\d\d\d\d\d\d/],
        ['HHmm', /\d\d\d\d/],
        ['HH', /\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime, dateFormat, timeFormat, tzFormat;

        if (match) {
            getParsingFlags(config).iso = true;

            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    utils_hooks__hooks.createFromInputFallback = deprecate(
        'value provided is not in a recognized ISO format. moment construction falls back to js Date(), ' +
        'which is not reliable across all browsers and versions. Non ISO date formats are ' +
        'discouraged and will be removed in an upcoming major release. Please refer to ' +
        'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(utils_hooks__hooks.now());
        if (config._useUTC) {
            return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray (config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);
            week = defaults(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

    // constant that refers to the ISO standard
    utils_hooks__hooks.ISO_8601 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === utils_hooks__hooks.ISO_8601) {
            configFromISO(config);
            return;
        }

        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            // console.log('token', token, 'parsedInput', parsedInput,
            //         'regex', getParseRegexForToken(token, config));
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (config._a[HOUR] <= 12 &&
            getParsingFlags(config).bigHour === true &&
            config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }

        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap (locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    // date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!valid__isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
            return obj && parseInt(obj, 10);
        });

        configFromArray(config);
    }

    function createFromConfig (config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig (config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || locale_locales__getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return valid__createInvalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (isDate(input)) {
            config._d = input;
        } else if (format) {
            configFromStringAndFormat(config);
        }  else {
            configFromInput(config);
        }

        if (!valid__isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (input === undefined) {
            config._d = new Date(utils_hooks__hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (typeof(input) === 'object') {
            configFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC (input, format, locale, strict, isUTC) {
        var c = {};

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }

        if ((isObject(input) && isObjectEmpty(input)) ||
                (isArray(input) && input.length === 0)) {
            input = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function local__createLocal (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
        'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = local__createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other < this ? this : other;
            } else {
                return valid__createInvalid();
            }
        }
    );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = local__createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other > this ? this : other;
            } else {
                return valid__createInvalid();
            }
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return local__createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function () {
        return Date.now ? Date.now() : +(new Date());
    };

    function Duration (duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = locale_locales__getLocale();

        this._bubble();
    }

    function isDuration (obj) {
        return obj instanceof Duration;
    }

    function absRound (number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    // FORMATTING

    function offset (token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z',  matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = ((string || '').match(matcher) || []);
        var chunk   = matches[matches.length - 1] || [];
        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? input.valueOf() : local__createLocal(input).valueOf()) - res.valueOf();
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(res._d.valueOf() + diff);
            utils_hooks__hooks.updateOffset(res, false);
            return res;
        } else {
            return local__createLocal(input).local();
        }
    }

    function getDateOffset (m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    utils_hooks__hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset (input, keepLocalTime) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
            } else if (Math.abs(input) < 16) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    utils_hooks__hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone (input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC (keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal (keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset () {
        if (this._tzm) {
            this.utcOffset(this._tzm);
        } else if (typeof this._i === 'string') {
            var tZone = offsetFromString(matchOffset, this._i);

            if (tZone === 0) {
                this.utcOffset(0, true);
            } else {
                this.utcOffset(offsetFromString(matchOffset, this._i));
            }
        }
        return this;
    }

    function hasAlignedHourOffset (input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? local__createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime () {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted () {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? create_utc__createUTC(c._a) : local__createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal () {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset () {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc () {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

    // ASP.NET json date format regex
    var aspNetRegex = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    // and further modified to allow for strings containing both week and day
    var isoRegex = /^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;

    function create__createDuration (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms : input._milliseconds,
                d  : input._days,
                M  : input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y  : 0,
                d  : toInt(match[DATE])                         * sign,
                h  : toInt(match[HOUR])                         * sign,
                m  : toInt(match[MINUTE])                       * sign,
                s  : toInt(match[SECOND])                       * sign,
                ms : toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
            };
        } else if (!!(match = isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y : parseIso(match[2], sign),
                M : parseIso(match[3], sign),
                w : parseIso(match[4], sign),
                d : parseIso(match[5], sign),
                h : parseIso(match[6], sign),
                m : parseIso(match[7], sign),
                s : parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    create__createDuration.fn = Duration.prototype;

    function parseIso (inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return {milliseconds: 0, months: 0};
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
                'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = create__createDuration(val, period);
            add_subtract__addSubtract(this, dur, direction);
            return this;
        };
    }

    function add_subtract__addSubtract (mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (days) {
            get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);
        }
        if (months) {
            setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            utils_hooks__hooks.updateOffset(mom, days || months);
        }
    }

    var add_subtract__add      = createAdder(1, 'add');
    var add_subtract__subtract = createAdder(-1, 'subtract');

    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, 'days', true);
        return diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
    }

    function moment_calendar__calendar (time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || local__createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = utils_hooks__hooks.calendarFormat(this, sod) || 'sameElse';

        var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);

        return this.format(output || this.localeData().calendar(format, this, local__createLocal(now)));
    }

    function clone () {
        return new Moment(this);
    }

    function isAfter (input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore (input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween (from, to, units, inclusivity) {
        inclusivity = inclusivity || '()';
        return (inclusivity[0] === '(' ? this.isAfter(from, units) : !this.isBefore(from, units)) &&
            (inclusivity[1] === ')' ? this.isBefore(to, units) : !this.isAfter(to, units));
    }

    function isSame (input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units || 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
        }
    }

    function isSameOrAfter (input, units) {
        return this.isSame(input, units) || this.isAfter(input,units);
    }

    function isSameOrBefore (input, units) {
        return this.isSame(input, units) || this.isBefore(input,units);
    }

    function diff (input, units, asFloat) {
        var that,
            zoneDelta,
            delta, output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        if (units === 'year' || units === 'month' || units === 'quarter') {
            output = monthDiff(this, that);
            if (units === 'quarter') {
                output = output / 3;
            } else if (units === 'year') {
                output = output / 12;
            }
        } else {
            delta = this - that;
            output = units === 'second' ? delta / 1e3 : // 1000
                units === 'minute' ? delta / 6e4 : // 1000 * 60
                units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
                units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                delta;
        }
        return asFloat ? output : absFloor(output);
    }

    function monthDiff (a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        //check for negative zero, return zero if negative zero
        return -(wholeMonthDiff + adjust) || 0;
    }

    utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    utils_hooks__hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString () {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function moment_format__toISOString () {
        var m = this.clone().utc();
        if (0 < m.year() && m.year() <= 9999) {
            if (isFunction(Date.prototype.toISOString)) {
                // native implementation is ~50x faster, use it when we can
                return this.toDate().toISOString();
            } else {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        } else {
            return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        }
    }

    function format (inputString) {
        if (!inputString) {
            inputString = this.isUtc() ? utils_hooks__hooks.defaultFormatUtc : utils_hooks__hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 local__createLocal(time).isValid())) {
            return create__createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow (withoutSuffix) {
        return this.from(local__createLocal(), withoutSuffix);
    }

    function to (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 local__createLocal(time).isValid())) {
            return create__createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow (withoutSuffix) {
        return this.to(local__createLocal(), withoutSuffix);
    }

    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function locale (key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = locale_locales__getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData () {
        return this._locale;
    }

    function startOf (units) {
        units = normalizeUnits(units);
        // the following switch intentionally omits break keywords
        // to utilize falling through the cases.
        switch (units) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'quarter':
            case 'month':
                this.date(1);
                /* falls through */
            case 'week':
            case 'isoWeek':
            case 'day':
            case 'date':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
        }

        // weeks are a special case
        if (units === 'week') {
            this.weekday(0);
        }
        if (units === 'isoWeek') {
            this.isoWeekday(1);
        }

        // quarters are also special
        if (units === 'quarter') {
            this.month(Math.floor(this.month() / 3) * 3);
        }

        return this;
    }

    function endOf (units) {
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond') {
            return this;
        }

        // 'date' is an alias for 'day', so it should be considered as such.
        if (units === 'date') {
            units = 'day';
        }

        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
    }

    function to_type__valueOf () {
        return this._d.valueOf() - ((this._offset || 0) * 60000);
    }

    function unix () {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate () {
        return new Date(this.valueOf());
    }

    function toArray () {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject () {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function toJSON () {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null;
    }

    function moment_valid__isValid () {
        return valid__isValid(this);
    }

    function parsingFlags () {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt () {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
        };
    }

    // FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken (token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg',     'weekYear');
    addWeekYearFormatToken('ggggg',    'weekYear');
    addWeekYearFormatToken('GGGG',  'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PRIORITY

    addUnitPriority('weekYear', 1);
    addUnitPriority('isoWeekYear', 1);


    // PARSING

    addRegexToken('G',      matchSigned);
    addRegexToken('g',      matchSigned);
    addRegexToken('GG',     match1to2, match2);
    addRegexToken('gg',     match1to2, match2);
    addRegexToken('GGGG',   match1to4, match4);
    addRegexToken('gggg',   match1to4, match4);
    addRegexToken('GGGGG',  match1to6, match6);
    addRegexToken('ggggg',  match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = utils_hooks__hooks.parseTwoDigitYear(input);
    });

    // MOMENTS

    function getSetWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input,
                this.week(),
                this.weekday(),
                this.localeData()._week.dow,
                this.localeData()._week.doy);
    }

    function getSetISOWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }

    function getISOWeeksInYear () {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear () {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

    // FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PRIORITY

    addUnitPriority('quarter', 7);

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter (input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    // FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PRIOROITY
    addUnitPriority('date', 9);

    // PARSING

    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0], 10);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    // FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PRIORITY
    addUnitPriority('dayOfYear', 4);

    // PARSING

    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    // MOMENTS

    function getSetDayOfYear (input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

    // FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PRIORITY

    addUnitPriority('minute', 14);

    // PARSING

    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    // FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PRIORITY

    addUnitPriority('second', 15);

    // PARSING

    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    // FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PRIORITY

    addUnitPriority('millisecond', 16);

    // PARSING

    addRegexToken('S',    match1to3, match1);
    addRegexToken('SS',   match1to3, match2);
    addRegexToken('SSS',  match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

    // FORMATTING

    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr () {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName () {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var momentPrototype__proto = Moment.prototype;

    momentPrototype__proto.add               = add_subtract__add;
    momentPrototype__proto.calendar          = moment_calendar__calendar;
    momentPrototype__proto.clone             = clone;
    momentPrototype__proto.diff              = diff;
    momentPrototype__proto.endOf             = endOf;
    momentPrototype__proto.format            = format;
    momentPrototype__proto.from              = from;
    momentPrototype__proto.fromNow           = fromNow;
    momentPrototype__proto.to                = to;
    momentPrototype__proto.toNow             = toNow;
    momentPrototype__proto.get               = stringGet;
    momentPrototype__proto.invalidAt         = invalidAt;
    momentPrototype__proto.isAfter           = isAfter;
    momentPrototype__proto.isBefore          = isBefore;
    momentPrototype__proto.isBetween         = isBetween;
    momentPrototype__proto.isSame            = isSame;
    momentPrototype__proto.isSameOrAfter     = isSameOrAfter;
    momentPrototype__proto.isSameOrBefore    = isSameOrBefore;
    momentPrototype__proto.isValid           = moment_valid__isValid;
    momentPrototype__proto.lang              = lang;
    momentPrototype__proto.locale            = locale;
    momentPrototype__proto.localeData        = localeData;
    momentPrototype__proto.max               = prototypeMax;
    momentPrototype__proto.min               = prototypeMin;
    momentPrototype__proto.parsingFlags      = parsingFlags;
    momentPrototype__proto.set               = stringSet;
    momentPrototype__proto.startOf           = startOf;
    momentPrototype__proto.subtract          = add_subtract__subtract;
    momentPrototype__proto.toArray           = toArray;
    momentPrototype__proto.toObject          = toObject;
    momentPrototype__proto.toDate            = toDate;
    momentPrototype__proto.toISOString       = moment_format__toISOString;
    momentPrototype__proto.toJSON            = toJSON;
    momentPrototype__proto.toString          = toString;
    momentPrototype__proto.unix              = unix;
    momentPrototype__proto.valueOf           = to_type__valueOf;
    momentPrototype__proto.creationData      = creationData;

    // Year
    momentPrototype__proto.year       = getSetYear;
    momentPrototype__proto.isLeapYear = getIsLeapYear;

    // Week Year
    momentPrototype__proto.weekYear    = getSetWeekYear;
    momentPrototype__proto.isoWeekYear = getSetISOWeekYear;

    // Quarter
    momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;

    // Month
    momentPrototype__proto.month       = getSetMonth;
    momentPrototype__proto.daysInMonth = getDaysInMonth;

    // Week
    momentPrototype__proto.week           = momentPrototype__proto.weeks        = getSetWeek;
    momentPrototype__proto.isoWeek        = momentPrototype__proto.isoWeeks     = getSetISOWeek;
    momentPrototype__proto.weeksInYear    = getWeeksInYear;
    momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;

    // Day
    momentPrototype__proto.date       = getSetDayOfMonth;
    momentPrototype__proto.day        = momentPrototype__proto.days             = getSetDayOfWeek;
    momentPrototype__proto.weekday    = getSetLocaleDayOfWeek;
    momentPrototype__proto.isoWeekday = getSetISODayOfWeek;
    momentPrototype__proto.dayOfYear  = getSetDayOfYear;

    // Hour
    momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;

    // Minute
    momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;

    // Second
    momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;

    // Millisecond
    momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;

    // Offset
    momentPrototype__proto.utcOffset            = getSetOffset;
    momentPrototype__proto.utc                  = setOffsetToUTC;
    momentPrototype__proto.local                = setOffsetToLocal;
    momentPrototype__proto.parseZone            = setOffsetToParsedOffset;
    momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;
    momentPrototype__proto.isDST                = isDaylightSavingTime;
    momentPrototype__proto.isLocal              = isLocal;
    momentPrototype__proto.isUtcOffset          = isUtcOffset;
    momentPrototype__proto.isUtc                = isUtc;
    momentPrototype__proto.isUTC                = isUtc;

    // Timezone
    momentPrototype__proto.zoneAbbr = getZoneAbbr;
    momentPrototype__proto.zoneName = getZoneName;

    // Deprecations
    momentPrototype__proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    momentPrototype__proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    momentPrototype__proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
    momentPrototype__proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

    var momentPrototype = momentPrototype__proto;

    function moment__createUnix (input) {
        return local__createLocal(input * 1000);
    }

    function moment__createInZone () {
        return local__createLocal.apply(null, arguments).parseZone();
    }

    function preParsePostFormat (string) {
        return string;
    }

    var prototype__proto = Locale.prototype;

    prototype__proto.calendar        = locale_calendar__calendar;
    prototype__proto.longDateFormat  = longDateFormat;
    prototype__proto.invalidDate     = invalidDate;
    prototype__proto.ordinal         = ordinal;
    prototype__proto.preparse        = preParsePostFormat;
    prototype__proto.postformat      = preParsePostFormat;
    prototype__proto.relativeTime    = relative__relativeTime;
    prototype__proto.pastFuture      = pastFuture;
    prototype__proto.set             = locale_set__set;

    // Month
    prototype__proto.months            =        localeMonths;
    prototype__proto.monthsShort       =        localeMonthsShort;
    prototype__proto.monthsParse       =        localeMonthsParse;
    prototype__proto.monthsRegex       = monthsRegex;
    prototype__proto.monthsShortRegex  = monthsShortRegex;

    // Week
    prototype__proto.week = localeWeek;
    prototype__proto.firstDayOfYear = localeFirstDayOfYear;
    prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;

    // Day of Week
    prototype__proto.weekdays       =        localeWeekdays;
    prototype__proto.weekdaysMin    =        localeWeekdaysMin;
    prototype__proto.weekdaysShort  =        localeWeekdaysShort;
    prototype__proto.weekdaysParse  =        localeWeekdaysParse;

    prototype__proto.weekdaysRegex       =        weekdaysRegex;
    prototype__proto.weekdaysShortRegex  =        weekdaysShortRegex;
    prototype__proto.weekdaysMinRegex    =        weekdaysMinRegex;

    // Hours
    prototype__proto.isPM = localeIsPM;
    prototype__proto.meridiem = localeMeridiem;

    function lists__get (format, index, field, setter) {
        var locale = locale_locales__getLocale();
        var utc = create_utc__createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl (format, index, field) {
        if (typeof format === 'number') {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return lists__get(format, index, field, 'month');
        }

        var i;
        var out = [];
        for (i = 0; i < 12; i++) {
            out[i] = lists__get(format, i, field, 'month');
        }
        return out;
    }

    // ()
    // (5)
    // (fmt, 5)
    // (fmt)
    // (true)
    // (true, 5)
    // (true, fmt, 5)
    // (true, fmt)
    function listWeekdaysImpl (localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;

            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            format = format || '';
        }

        var locale = locale_locales__getLocale(),
            shift = localeSorted ? locale._week.dow : 0;

        if (index != null) {
            return lists__get(format, (index + shift) % 7, field, 'day');
        }

        var i;
        var out = [];
        for (i = 0; i < 7; i++) {
            out[i] = lists__get(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function lists__listMonths (format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function lists__listMonthsShort (format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function lists__listWeekdays (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function lists__listWeekdaysShort (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function lists__listWeekdaysMin (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }

    locale_locales__getSetGlobalLocale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports
    utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);
    utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);

    var mathAbs = Math.abs;

    function duration_abs__abs () {
        var data           = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days         = mathAbs(this._days);
        this._months       = mathAbs(this._months);

        data.milliseconds  = mathAbs(data.milliseconds);
        data.seconds       = mathAbs(data.seconds);
        data.minutes       = mathAbs(data.minutes);
        data.hours         = mathAbs(data.hours);
        data.months        = mathAbs(data.months);
        data.years         = mathAbs(data.years);

        return this;
    }

    function duration_add_subtract__addSubtract (duration, input, value, direction) {
        var other = create__createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days         += direction * other._days;
        duration._months       += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function duration_add_subtract__add (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function duration_add_subtract__subtract (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, -1);
    }

    function absCeil (number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble () {
        var milliseconds = this._milliseconds;
        var days         = this._days;
        var months       = this._months;
        var data         = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds           = absFloor(milliseconds / 1000);
        data.seconds      = seconds % 60;

        minutes           = absFloor(seconds / 60);
        data.minutes      = minutes % 60;

        hours             = absFloor(minutes / 60);
        data.hours        = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days   = days;
        data.months = months;
        data.years  = years;

        return this;
    }

    function daysToMonths (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays (months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as (units) {
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'year') {
            days   = this._days   + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            return units === 'month' ? months : months / 12;
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week'   : return days / 7     + milliseconds / 6048e5;
                case 'day'    : return days         + milliseconds / 864e5;
                case 'hour'   : return days * 24    + milliseconds / 36e5;
                case 'minute' : return days * 1440  + milliseconds / 6e4;
                case 'second' : return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function duration_as__valueOf () {
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs (alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds      = makeAs('s');
    var asMinutes      = makeAs('m');
    var asHours        = makeAs('h');
    var asDays         = makeAs('d');
    var asWeeks        = makeAs('w');
    var asMonths       = makeAs('M');
    var asYears        = makeAs('y');

    function duration_get__get (units) {
        units = normalizeUnits(units);
        return this[units + 's']();
    }

    function makeGetter(name) {
        return function () {
            return this._data[name];
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds      = makeGetter('seconds');
    var minutes      = makeGetter('minutes');
    var hours        = makeGetter('hours');
    var days         = makeGetter('days');
    var months       = makeGetter('months');
    var years        = makeGetter('years');

    function weeks () {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        s: 45,  // seconds to minute
        m: 45,  // minutes to hour
        h: 22,  // hours to day
        d: 26,  // days to month
        M: 11   // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function duration_humanize__relativeTime (posNegDuration, withoutSuffix, locale) {
        var duration = create__createDuration(posNegDuration).abs();
        var seconds  = round(duration.as('s'));
        var minutes  = round(duration.as('m'));
        var hours    = round(duration.as('h'));
        var days     = round(duration.as('d'));
        var months   = round(duration.as('M'));
        var years    = round(duration.as('y'));

        var a = seconds < thresholds.s && ['s', seconds]  ||
                minutes <= 1           && ['m']           ||
                minutes < thresholds.m && ['mm', minutes] ||
                hours   <= 1           && ['h']           ||
                hours   < thresholds.h && ['hh', hours]   ||
                days    <= 1           && ['d']           ||
                days    < thresholds.d && ['dd', days]    ||
                months  <= 1           && ['M']           ||
                months  < thresholds.M && ['MM', months]  ||
                years   <= 1           && ['y']           || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set the rounding function for relative time strings
    function duration_humanize__getSetRelativeTimeRounding (roundingFunction) {
        if (roundingFunction === undefined) {
            return round;
        }
        if (typeof(roundingFunction) === 'function') {
            round = roundingFunction;
            return true;
        }
        return false;
    }

    // This function allows you to set a threshold for relative time strings
    function duration_humanize__getSetRelativeTimeThreshold (threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        return true;
    }

    function humanize (withSuffix) {
        var locale = this.localeData();
        var output = duration_humanize__relativeTime(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var iso_string__abs = Math.abs;

    function iso_string__toISOString() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        var seconds = iso_string__abs(this._milliseconds) / 1000;
        var days         = iso_string__abs(this._days);
        var months       = iso_string__abs(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes           = absFloor(seconds / 60);
        hours             = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years  = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds;
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        return (total < 0 ? '-' : '') +
            'P' +
            (Y ? Y + 'Y' : '') +
            (M ? M + 'M' : '') +
            (D ? D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? h + 'H' : '') +
            (m ? m + 'M' : '') +
            (s ? s + 'S' : '');
    }

    var duration_prototype__proto = Duration.prototype;

    duration_prototype__proto.abs            = duration_abs__abs;
    duration_prototype__proto.add            = duration_add_subtract__add;
    duration_prototype__proto.subtract       = duration_add_subtract__subtract;
    duration_prototype__proto.as             = as;
    duration_prototype__proto.asMilliseconds = asMilliseconds;
    duration_prototype__proto.asSeconds      = asSeconds;
    duration_prototype__proto.asMinutes      = asMinutes;
    duration_prototype__proto.asHours        = asHours;
    duration_prototype__proto.asDays         = asDays;
    duration_prototype__proto.asWeeks        = asWeeks;
    duration_prototype__proto.asMonths       = asMonths;
    duration_prototype__proto.asYears        = asYears;
    duration_prototype__proto.valueOf        = duration_as__valueOf;
    duration_prototype__proto._bubble        = bubble;
    duration_prototype__proto.get            = duration_get__get;
    duration_prototype__proto.milliseconds   = milliseconds;
    duration_prototype__proto.seconds        = seconds;
    duration_prototype__proto.minutes        = minutes;
    duration_prototype__proto.hours          = hours;
    duration_prototype__proto.days           = days;
    duration_prototype__proto.weeks          = weeks;
    duration_prototype__proto.months         = months;
    duration_prototype__proto.years          = years;
    duration_prototype__proto.humanize       = humanize;
    duration_prototype__proto.toISOString    = iso_string__toISOString;
    duration_prototype__proto.toString       = iso_string__toISOString;
    duration_prototype__proto.toJSON         = iso_string__toISOString;
    duration_prototype__proto.locale         = locale;
    duration_prototype__proto.localeData     = localeData;

    // Deprecations
    duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);
    duration_prototype__proto.lang = lang;

    // Side effect imports

    // FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    // Side effect imports


    utils_hooks__hooks.version = '2.15.2';

    setHookCallback(local__createLocal);

    utils_hooks__hooks.fn                    = momentPrototype;
    utils_hooks__hooks.min                   = min;
    utils_hooks__hooks.max                   = max;
    utils_hooks__hooks.now                   = now;
    utils_hooks__hooks.utc                   = create_utc__createUTC;
    utils_hooks__hooks.unix                  = moment__createUnix;
    utils_hooks__hooks.months                = lists__listMonths;
    utils_hooks__hooks.isDate                = isDate;
    utils_hooks__hooks.locale                = locale_locales__getSetGlobalLocale;
    utils_hooks__hooks.invalid               = valid__createInvalid;
    utils_hooks__hooks.duration              = create__createDuration;
    utils_hooks__hooks.isMoment              = isMoment;
    utils_hooks__hooks.weekdays              = lists__listWeekdays;
    utils_hooks__hooks.parseZone             = moment__createInZone;
    utils_hooks__hooks.localeData            = locale_locales__getLocale;
    utils_hooks__hooks.isDuration            = isDuration;
    utils_hooks__hooks.monthsShort           = lists__listMonthsShort;
    utils_hooks__hooks.weekdaysMin           = lists__listWeekdaysMin;
    utils_hooks__hooks.defineLocale          = defineLocale;
    utils_hooks__hooks.updateLocale          = updateLocale;
    utils_hooks__hooks.locales               = locale_locales__listLocales;
    utils_hooks__hooks.weekdaysShort         = lists__listWeekdaysShort;
    utils_hooks__hooks.normalizeUnits        = normalizeUnits;
    utils_hooks__hooks.relativeTimeRounding = duration_humanize__getSetRelativeTimeRounding;
    utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;
    utils_hooks__hooks.calendarFormat        = getCalendarFormat;
    utils_hooks__hooks.prototype             = momentPrototype;

    var _moment = utils_hooks__hooks;

    return _moment;

}));
},{}],2:[function(require,module,exports){
module.exports=[{"oz":2,"t":1446410230707},{"oz":4,"t":1446410907333},{"oz":2,"t":1446415648475},{"oz":4,"t":1446423849610},{"oz":4,"t":1446429160662},{"oz":4,"t":1446437443781},{"oz":4,"t":1446441872227},{"oz":4,"t":1446452869007},{"oz":4,"t":1446467887217},{"oz":4,"t":1446477125397},{"oz":4,"t":1446486433607},{"oz":4,"t":1446495097268},{"oz":4,"t":1446503598082},{"oz":2,"t":1446508047733},{"oz":2,"t":1446509794166},{"oz":4,"t":1446517856424},{"oz":4,"t":1446524024799},{"oz":4,"t":1446541144218},{"oz":4,"t":1446552861289},{"oz":4,"t":1446562602252},{"oz":4,"t":1446572610140},{"oz":4,"t":1446578683839},{"oz":4,"t":1446586186689},{"oz":4,"t":1446592615014},{"oz":4,"t":1446600266379},{"oz":4,"t":1446607727645},{"oz":4,"t":1446611733308},{"oz":6,"t":1446624332962},{"oz":4,"t":1446635148581},{"oz":4,"t":1446645288708},{"oz":4,"t":1446651884379},{"oz":4,"t":1446658054352},{"oz":4,"t":1446663736751},{"oz":4,"t":1446671559187},{"oz":4,"t":1446677976535},{"oz":2,"t":1446683990366},{"oz":2,"t":1446685077964},{"oz":4,"t":1446695049152},{"oz":2,"t":1446697123299},{"oz":6,"t":1446704636724},{"oz":4,"t":1446715327722},{"oz":4,"t":1446726516496},{"oz":4,"t":1446736563540},{"oz":4,"t":1446743963956},{"oz":4,"t":1446753330766},{"oz":4,"t":1446756478626},{"oz":4,"t":1446762829215},{"oz":2,"t":1446768857678},{"oz":4,"t":1446772999528},{"oz":4,"t":1446780783081},{"oz":6,"t":1446785506046},{"oz":6,"t":1446796283059},{"oz":4,"t":1446808959208},{"oz":4,"t":1446818292004},{"oz":4,"t":1446827485546},{"oz":4,"t":1446833141685},{"oz":6,"t":1446841919812},{"oz":4,"t":1446853454155},{"oz":4,"t":1446860116927},{"oz":4,"t":1446866577191},{"oz":4,"t":1446869700160},{"oz":6,"t":1446883307786},{"oz":6,"t":1446899604626},{"oz":4,"t":1446911798539},{"oz":4,"t":1446915776308},{"oz":4,"t":1446926693712},{"oz":4,"t":1446932242633},{"oz":4,"t":1446938090467},{"oz":4,"t":1446944798352},{"oz":6,"t":1446953137406},{"oz":4,"t":1446958471921},{"oz":6,"t":1446969184628},{"oz":4,"t":1446980473287},{"oz":2,"t":1446988917332},{"oz":2,"t":1446990893788},{"oz":4,"t":1447001083451},{"oz":2,"t":1447006334579},{"oz":2,"t":1447008817173},{"oz":4,"t":1447014140560},{"oz":4,"t":1447022016200},{"oz":2,"t":1447022759513},{"oz":2,"t":1447028138813},{"oz":2,"t":1447030653768},{"oz":4,"t":1447040268393},{"oz":6,"t":1447045171175},{"oz":6,"t":1447057255785},{"oz":4,"t":1447068516542},{"oz":4,"t":1447076549452},{"oz":4,"t":1447085018379},{"oz":4,"t":1447092136029},{"oz":4,"t":1447099868172},{"oz":4,"t":1447107940226},{"oz":4,"t":1447112488818},{"oz":4,"t":1447118597844},{"oz":4,"t":1447123665165},{"oz":4,"t":1447130675257},{"oz":4,"t":1447142111596},{"oz":6,"t":1447154379951},{"oz":4,"t":1447166697584},{"oz":4,"t":1447174492998},{"oz":4,"t":1447182163959},{"oz":4,"t":1447193599689},{"oz":4,"t":1447200736803},{"oz":4,"t":1447200737559},{"oz":2,"t":1447206971351},{"oz":4,"t":1447213485936},{"oz":4,"t":1447222092933},{"oz":6,"t":1447232638574},{"oz":4,"t":1447246965812},{"oz":4,"t":1447259795896},{"oz":4,"t":1447266356225},{"oz":4,"t":1447274684330},{"oz":4,"t":1447279665849},{"oz":4,"t":1447290430745},{"oz":4,"t":1447297855912},{"oz":2,"t":1447303067217},{"oz":2,"t":1447305230273},{"oz":4,"t":1447314124179},{"oz":4,"t":1447328174485},{"oz":4,"t":1447340306321},{"oz":2,"t":1447349838338},{"oz":2,"t":1447350956036},{"oz":4,"t":1447359941197},{"oz":2,"t":1447368875003},{"oz":2,"t":1447370399457},{"oz":2,"t":1447377681111},{"oz":2,"t":1447382641655},{"oz":2,"t":1447386711336},{"oz":2,"t":1447388991497},{"oz":2,"t":1447391216671},{"oz":4,"t":1447400092167},{"oz":4,"t":1447414221478},{"oz":2,"t":1447423675690},{"oz":2,"t":1447424634926},{"oz":4,"t":1447437328827},{"oz":4,"t":1447444720635},{"oz":2,"t":1447445254438},{"oz":2,"t":1447452647014},{"oz":4,"t":1447458877496},{"oz":4,"t":1447465908383},{"oz":4,"t":1447474795064},{"oz":4,"t":1447480730662},{"oz":4,"t":1447493488255},{"oz":2,"t":1447493971990},{"oz":4,"t":1447505604794},{"oz":4,"t":1447514884718},{"oz":4,"t":1447526301393},{"oz":4,"t":1447535490653},{"oz":2,"t":1447536106361},{"oz":4,"t":1447545643223},{"oz":2,"t":1447546091076},{"oz":4,"t":1447553664819},{"oz":4,"t":1447559796479},{"oz":2,"t":1447562967282},{"oz":6,"t":1447574752675},{"oz":4,"t":1447586660205},{"oz":4,"t":1447596216979},{"oz":4,"t":1447606975357},{"oz":2,"t":1447612923807},{"oz":2,"t":1447613359892},{"oz":4,"t":1447621639671},{"oz":4,"t":1447627999593},{"oz":4,"t":1447635942040},{"oz":4,"t":1447643439621},{"oz":2,"t":1447644920570},{"oz":2,"t":1447649472883},{"oz":4,"t":1447653563414},{"oz":6,"t":1447666895144},{"oz":4,"t":1447678965732},{"oz":4,"t":1447687444588},{"oz":4,"t":1447698874515},{"oz":4,"t":1447708607638},{"oz":4,"t":1447714705773},{"oz":4,"t":1447721387936},{"oz":4,"t":1447733931910},{"oz":4,"t":1447737604002},{"oz":6,"t":1447747847163},{"oz":4,"t":1447760466291},{"oz":4,"t":1447767643622},{"oz":4,"t":1447777129705},{"oz":4,"t":1447782714068},{"oz":4,"t":1447791311480},{"oz":4,"t":1447799495848},{"oz":4,"t":1447808665557},{"oz":4,"t":1447814729089},{"oz":2,"t":1447821615789},{"oz":4,"t":1447826472838},{"oz":2,"t":1447828123362},{"oz":6,"t":1447840136182},{"oz":4,"t":1447848495266},{"oz":4,"t":1447856294754},{"oz":4,"t":1447864390651},{"oz":2,"t":1447868675632},{"oz":4,"t":1447873093766},{"oz":6,"t":1447882632750},{"oz":4,"t":1447890649305},{"oz":4,"t":1447898900918},{"oz":4,"t":1447905033588},{"oz":2,"t":1447910540209},{"oz":4,"t":1447919519189},{"oz":2,"t":1447920000426},{"oz":6,"t":1447931807643},{"oz":4,"t":1447944723372},{"oz":4,"t":1447951977813},{"oz":4,"t":1447958272896},{"oz":2,"t":1447964087937},{"oz":2,"t":1447964704032},{"oz":4,"t":1447970307264},{"oz":4,"t":1447975543630},{"oz":4,"t":1447981307238},{"oz":4,"t":1447986815905},{"oz":2,"t":1447992322342},{"oz":4,"t":1447997025561},{"oz":6,"t":1448010038797},{"oz":4,"t":1448024811114},{"oz":4,"t":1448033361119},{"oz":2,"t":1448041598315},{"oz":2,"t":1448043001885},{"oz":4,"t":1448044626841},{"oz":4,"t":1448049536539},{"oz":6,"t":1448053910554},{"oz":4,"t":1448069972564},{"oz":4,"t":1448060594246},{"oz":2,"t":1448075312244},{"oz":2,"t":1448076739749},{"oz":4,"t":1448088124002},{"oz":6,"t":1448101064253},{"oz":4,"t":1448112601105},{"oz":4,"t":1448121218961},{"oz":4,"t":1448131345062},{"oz":4,"t":1448135329676},{"oz":4,"t":1448142715335},{"oz":4,"t":1448151140335},{"oz":2,"t":1448156536473},{"oz":4,"t":1448160778096},{"oz":4,"t":1448166109207},{"oz":4,"t":1448172420604},{"oz":6,"t":1448186169755},{"oz":4,"t":1448197282708},{"oz":4,"t":1448202545421},{"oz":4,"t":1448211373516},{"oz":4,"t":1448221267923},{"oz":2,"t":1448227226764},{"oz":4,"t":1448233144093},{"oz":4,"t":1448242013374},{"oz":4,"t":1448249002685},{"oz":6,"t":1448254835682},{"oz":6,"t":1448266289678},{"oz":6,"t":1448281738074},{"oz":4,"t":1448290536229},{"oz":4,"t":1448299372670},{"oz":4,"t":1448308121356},{"oz":2,"t":1448308636927},{"oz":4,"t":1448316643846},{"oz":4,"t":1448325662339},{"oz":4,"t":1448332366511},{"oz":4,"t":1448336162377},{"oz":6,"t":1448346833770},{"oz":6,"t":1448361512958},{"oz":4,"t":1448373697210},{"oz":6,"t":1448383874059},{"oz":4,"t":1448393214840},{"oz":4,"t":1448399457478},{"oz":4,"t":1448407811082},{"oz":4,"t":1448415439817},{"oz":4,"t":1448424407620},{"oz":4,"t":1448429275774},{"oz":6,"t":1448438954433},{"oz":6,"t":1448453370938},{"oz":2,"t":1448461595880},{"oz":4,"t":1448472798348},{"oz":2,"t":1448475448793},{"oz":4,"t":1448481843753},{"oz":4,"t":1448490051579},{"oz":4,"t":1448499953215},{"oz":2,"t":1448501191775},{"oz":4,"t":1448508341770},{"oz":2,"t":1448512753601},{"oz":2,"t":1448514248414},{"oz":6,"t":1448524171723},{"oz":4,"t":1448537670701},{"oz":2,"t":1448539272470},{"oz":2,"t":1448552200577},{"oz":2,"t":1448553729243},{"oz":4,"t":1448558879967},{"oz":4,"t":1448566806432},{"oz":2,"t":1448568099715},{"oz":2,"t":1448574411500},{"oz":2,"t":1448578529172},{"oz":4,"t":1448585486723},{"oz":4,"t":1448590196680},{"oz":6,"t":1448596308306},{"oz":6,"t":1448617514201},{"oz":4,"t":1448625257149},{"oz":4,"t":1448638482110},{"oz":2,"t":1448638947932},{"oz":4,"t":1448646100570},{"oz":6,"t":1448650847584},{"oz":4,"t":1448658235606},{"oz":4,"t":1448668325370},{"oz":4,"t":1448673681920},{"oz":2,"t":1448681239541},{"oz":2,"t":1448681782218},{"oz":2,"t":1448685575502},{"oz":6,"t":1448697560727},{"oz":6,"t":1448708273154},{"oz":4,"t":1448723155982},{"oz":2,"t":1448730020303},{"oz":4,"t":1448739333514},{"oz":4,"t":1448750005042},{"oz":2,"t":1448757618499},{"oz":2,"t":1448758686688},{"oz":4,"t":1448763977844},{"oz":4,"t":1448767282706},{"oz":6,"t":1448779069436},{"oz":6,"t":1448793938992},{"oz":4,"t":1448803177219},{"oz":4,"t":1448815291689},{"oz":2,"t":1448816156412},{"oz":2,"t":1448822268848},{"oz":4,"t":1448826787200},{"oz":2,"t":1448831739975},{"oz":4,"t":1448836119535},{"oz":4,"t":1448845512935},{"oz":4,"t":1448854379688},{"oz":4,"t":1448858868981},{"oz":6,"t":1448865135114},{"oz":6,"t":1448888688461},{"oz":2,"t":1448900572354},{"oz":2,"t":1448906492081},{"oz":4,"t":1448912831971},{"oz":4,"t":1448920626758},{"oz":2,"t":1448924142600},{"oz":4,"t":1448931478676},{"oz":4,"t":1448942299942},{"oz":4,"t":1448946321376},{"oz":6,"t":1448957280055},{"oz":4,"t":1448974228362},{"oz":4,"t":1448990339227},{"oz":2,"t":1448990693006},{"oz":2,"t":1448995397187},{"oz":2,"t":1449000254607},{"oz":4,"t":1449011291982},{"oz":2,"t":1449012350002},{"oz":4,"t":1449020373833},{"oz":4,"t":1449026584828},{"oz":2,"t":1449029900899},{"oz":2,"t":1449030585653},{"oz":6,"t":1449043314610},{"oz":6,"t":1449055879402},{"oz":4,"t":1449064806955},{"oz":2,"t":1449073137485},{"oz":2,"t":1449075753898},{"oz":4,"t":1449082759232},{"oz":4,"t":1449091503173},{"oz":2,"t":1449098770929},{"oz":2,"t":1449101264450},{"oz":4,"t":1449113223560},{"oz":5,"t":1449120627467},{"oz":3,"t":1449131359881},{"oz":4,"t":1449151839394},{"oz":3,"t":1449162800317},{"oz":2,"t":1449167598106},{"oz":2,"t":1449175472902},{"oz":2,"t":1449175732470},{"oz":2,"t":1449181749646},{"oz":1,"t":1449186441091},{"oz":2,"t":1449192697698},{"oz":2,"t":1449192952837},{"oz":1,"t":1449198102157},{"oz":2,"t":1449204737186},{"oz":1,"t":1449204991304},{"oz":1,"t":1449207884712},{"oz":2,"t":1449211693053},{"oz":4,"t":1449220514141},{"oz":4,"t":1449237502209},{"oz":2,"t":1449245530459},{"oz":1,"t":1449251284206},{"oz":2,"t":1449255799054},{"oz":2,"t":1449261186000},{"oz":2,"t":1449265154367},{"oz":4,"t":1449272219739},{"oz":1,"t":1449277097379},{"oz":2,"t":1449284905680},{"oz":2,"t":1449290351160},{"oz":2,"t":1449291298453},{"oz":2,"t":1449292924259},{"oz":4,"t":1449296322276},{"oz":2,"t":1449314076039},{"oz":1,"t":1449314769419},{"oz":2,"t":1449321578767},{"oz":2,"t":1449322020402},{"oz":2,"t":1449334498656},{"oz":1,"t":1449335524920},{"oz":2,"t":1449343414957},{"oz":2,"t":1449350581645},{"oz":1,"t":1449355521772},{"oz":1,"t":1449356330141},{"oz":3,"t":1449362269385},{"oz":2,"t":1449368921577},{"oz":2,"t":1449373557048},{"oz":3,"t":1449376267022},{"oz":4,"t":1449394356944},{"oz":2,"t":1449415680929},{"oz":4,"t":1449424287462},{"oz":2,"t":1449433411941},{"oz":2,"t":1449441248585},{"oz":2,"t":1449444371572},{"oz":4,"t":1449451005742},{"oz":1,"t":1449458530912},{"oz":4,"t":1449462026859},{"oz":2,"t":1449463781462},{"oz":3,"t":1449467692809},{"oz":1,"t":1449471389826},{"oz":4,"t":1449479074956},{"oz":4,"t":1449489602657},{"oz":1,"t":1449491554988},{"oz":2,"t":1449502350485},{"oz":2,"t":1449502745066},{"oz":1,"t":1449503727915},{"oz":2,"t":1449511175387},{"oz":4,"t":1449518430336},{"oz":4,"t":1449524499827},{"oz":2,"t":1449528219201},{"oz":4,"t":1449539936404},{"oz":2,"t":1449544926366},{"oz":4,"t":1449548765234},{"oz":2,"t":1449550446260},{"oz":5,"t":1449560816337},{"oz":6,"t":1449574119263},{"oz":2,"t":1449587224111},{"oz":1,"t":1449587726137},{"oz":4,"t":1449598163123},{"oz":2,"t":1449607364261},{"oz":2,"t":1449611230024},{"oz":4,"t":1449616948027},{"oz":2,"t":1449620754654},{"oz":2,"t":1449621380643},{"oz":4,"t":1449627026554},{"oz":4,"t":1449635748718},{"oz":6,"t":1449638682853},{"oz":6,"t":1449649861710},{"oz":6,"t":1449660795889},{"oz":2,"t":1449668972786},{"oz":1,"t":1449670448574},{"oz":1,"t":1449677379403},{"oz":1,"t":1449678203825},{"oz":4,"t":1449689677731},{"oz":2,"t":1449694353953},{"oz":4,"t":1449704038042},{"oz":2,"t":1449708650092},{"oz":4,"t":1449712772702},{"oz":1,"t":1449713584359},{"oz":4,"t":1449720386250},{"oz":4,"t":1449724864824},{"oz":3,"t":1449728360358},{"oz":6,"t":1449736943396},{"oz":4,"t":1449749169833},{"oz":2,"t":1449759051322},{"oz":1,"t":1449760809343},{"oz":4,"t":1449773062674},{"oz":2,"t":1449773999446},{"oz":4,"t":1449781747509},{"oz":2,"t":1449786705500},{"oz":4,"t":1449790980616},{"oz":4,"t":1449798424837},{"oz":4,"t":1449806162768},{"oz":4,"t":1449811464961},{"oz":6,"t":1449815735361},{"oz":6,"t":1449826128768},{"oz":4,"t":1449834492296},{"oz":6,"t":1449842887602},{"oz":2,"t":1449853334628},{"oz":4,"t":1449862979547},{"oz":4,"t":1449866825849},{"oz":4,"t":1449872232181},{"oz":2,"t":1449877542265},{"oz":2,"t":1449878168384},{"oz":4,"t":1449883525865},{"oz":4,"t":1449888779091},{"oz":4,"t":1449895503997},{"oz":2,"t":1449897859841},{"oz":6,"t":1449908627849},{"oz":6,"t":1449918739825},{"oz":2,"t":1449931368399},{"oz":2,"t":1449932880179},{"oz":4,"t":1449938894540},{"oz":4,"t":1449947974430},{"oz":4,"t":1449953126076},{"oz":4,"t":1449958963094},{"oz":2,"t":1449964698809},{"oz":2,"t":1449971106645},{"oz":4,"t":1449974659334},{"oz":4,"t":1449978501389},{"oz":6,"t":1449982227708},{"oz":6,"t":1449994548140},{"oz":4,"t":1450004254338},{"oz":3,"t":1450012711584},{"oz":4,"t":1450025313802},{"oz":4,"t":1450031515624},{"oz":4,"t":1450040621666},{"oz":4,"t":1450051408342},{"oz":3,"t":1450056302533},{"oz":4,"t":1450063168662},{"oz":4,"t":1450069166987},{"oz":6,"t":1450080615796},{"oz":6,"t":1450092932956},{"oz":2,"t":1450101135370},{"oz":4,"t":1450107835668},{"oz":2,"t":1450116472092},{"oz":4,"t":1450120571943},{"oz":2,"t":1450124976942},{"oz":4,"t":1450131663206},{"oz":4,"t":1450138144733},{"oz":4,"t":1450149697491},{"oz":6,"t":1450155631123},{"oz":6,"t":1450167212207},{"oz":3,"t":1450177203298},{"oz":3,"t":1450186750968},{"oz":1,"t":1450194060468},{"oz":3,"t":1450197030707},{"oz":4,"t":1450202643597},{"oz":4,"t":1450209373807},{"oz":4,"t":1450219895293},{"oz":4,"t":1450226816793},{"oz":2,"t":1450234413201},{"oz":1,"t":1450234927237},{"oz":6,"t":1450240842958},{"oz":2,"t":1450243093134},{"oz":6,"t":1450253151500},{"oz":4,"t":1450269604918},{"oz":2,"t":1450280619731},{"oz":1,"t":1450282749963},{"oz":4,"t":1450290300824},{"oz":2,"t":1450300737243},{"oz":4,"t":1450312902512},{"oz":2,"t":1450317001110},{"oz":6,"t":1450327506598},{"oz":2,"t":1450333132073},{"oz":6,"t":1450344280172},{"oz":4,"t":1450355115033},{"oz":4,"t":1450363109834},{"oz":2,"t":1450374615818},{"oz":4,"t":1450381064290},{"oz":4,"t":1450385127822},{"oz":4,"t":1450392909819},{"oz":4,"t":1450400576381},{"oz":3,"t":1450409403380},{"oz":2,"t":1450413294298},{"oz":2,"t":1450413588482},{"oz":4,"t":1450417623161},{"oz":6,"t":1450429096812},{"oz":4,"t":1450445741213},{"oz":4,"t":1450453646848},{"oz":3,"t":1450463096589},{"oz":4,"t":1450467259001},{"oz":1,"t":1450474588511},{"oz":4,"t":1450480931499},{"oz":6,"t":1450486799867},{"oz":4,"t":1450495858472},{"oz":6,"t":1450501730531},{"oz":6,"t":1450513899847},{"oz":4,"t":1450528781168},{"oz":4,"t":1450537411916},{"oz":3,"t":1450549285034},{"oz":4,"t":1450555205712},{"oz":2,"t":1450560964616},{"oz":2,"t":1450568812817},{"oz":4,"t":1450577191254},{"oz":4,"t":1450582229560},{"oz":2,"t":1450586273403},{"oz":6,"t":1450602766185},{"oz":4,"t":1450612880912},{"oz":4,"t":1450631614215},{"oz":4,"t":1450642349470},{"oz":1,"t":1450644615198},{"oz":4,"t":1450650593717},{"oz":4,"t":1450661238023},{"oz":2,"t":1450669947106},{"oz":1,"t":1450670664801},{"oz":4,"t":1450675429984},{"oz":2,"t":1450676030272},{"oz":6,"t":1450688677577},{"oz":6,"t":1450708475394},{"oz":2,"t":1450717802013},{"oz":2,"t":1450724394483},{"oz":4,"t":1450731319678},{"oz":1,"t":1450735738161},{"oz":4,"t":1450740214605},{"oz":2,"t":1450740462880},{"oz":4,"t":1450752956557},{"oz":3,"t":1450759457707},{"oz":2,"t":1450763530269},{"oz":4,"t":1450778490878},{"oz":4,"t":1450792140281},{"oz":1,"t":1450802196943},{"oz":4,"t":1450809202174},{"oz":4,"t":1450823029249},{"oz":6,"t":1450833654103},{"oz":2,"t":1450839803504},{"oz":4,"t":1450847441136},{"oz":6,"t":1450848540109},{"oz":6,"t":1450865304689},{"oz":4,"t":1450876797270},{"oz":3,"t":1450887109531},{"oz":3,"t":1450896869931},{"oz":2,"t":1450902674196},{"oz":1,"t":1450902996300},{"oz":2,"t":1450910424529},{"oz":4,"t":1450915449085},{"oz":2,"t":1450927903726},{"oz":2,"t":1450924388728},{"oz":3,"t":1450928165276},{"oz":3,"t":1450933278994},{"oz":4,"t":1450937918957},{"oz":5,"t":1450957217533},{"oz":1,"t":1450968549487},{"oz":2,"t":1450975542571},{"oz":2,"t":1450981213214},{"oz":2,"t":1450991122106},{"oz":2,"t":1450996755637},{"oz":2,"t":1451001763840},{"oz":2,"t":1451002138797},{"oz":2,"t":1451009141334},{"oz":3,"t":1451014708988},{"oz":4,"t":1451018244949},{"oz":6,"t":1451030807475},{"oz":2,"t":1451045528892},{"oz":2,"t":1451053416731},{"oz":1,"t":1451054535335},{"oz":1,"t":1451064489867},{"oz":2,"t":1451065369226},{"oz":2,"t":1451069716902},{"oz":1,"t":1451076869342},{"oz":2,"t":1451080518756},{"oz":4,"t":1451086034602},{"oz":2,"t":1451091449415},{"oz":2,"t":1451092761863},{"oz":4,"t":1451104313790},{"oz":2,"t":1451104674264},{"oz":4,"t":1451114054485},{"oz":6,"t":1451127725077},{"oz":2,"t":1451139289869},{"oz":2,"t":1451139404236},{"oz":4,"t":1451150820422},{"oz":2,"t":1451155722675},{"oz":2,"t":1451161268768},{"oz":2,"t":1451164989724},{"oz":2,"t":1451169125692},{"oz":3,"t":1451178689405},{"oz":2,"t":1451180868960},{"oz":4,"t":1451188744626},{"oz":4,"t":1451194184813},{"oz":6,"t":1451214373508},{"oz":4,"t":1451228150506},{"oz":1,"t":1451235724890},{"oz":2,"t":1451246289820},{"oz":2,"t":1451246604687},{"oz":2,"t":1451253810174},{"oz":2,"t":1451256627498},{"oz":2,"t":1451265099785},{"oz":4,"t":1451272308801},{"oz":2,"t":1451281817969},{"oz":6,"t":1451291267954},{"oz":4,"t":1451307232141},{"oz":3,"t":1451314795234},{"oz":2,"t":1451318806038},{"oz":1,"t":1451325218827},{"oz":4,"t":1451332116749},{"oz":2,"t":1451338897427},{"oz":2,"t":1451346715142},{"oz":4,"t":1451354176212},{"oz":4,"t":1451362179393},{"oz":2,"t":1451362492802},{"oz":6,"t":1451374885135},{"oz":6,"t":1451392179383},{"oz":2,"t":1451404123893},{"oz":2,"t":1451411345902},{"oz":2,"t":1451414423012},{"oz":4,"t":1451426704800},{"oz":4,"t":1451433840935},{"oz":1,"t":1451437961671},{"oz":4,"t":1451445768683},{"oz":2,"t":1451446966326},{"oz":2,"t":1451451668825},{"oz":6,"t":1451466129052},{"oz":4,"t":1451476475542},{"oz":4,"t":1451491925334},{"oz":2,"t":1451501833104},{"oz":4,"t":1451509756212},{"oz":2,"t":1451511415877},{"oz":4,"t":1451519116865},{"oz":4,"t":1451524824720},{"oz":4,"t":1451532377853},{"oz":1,"t":1451538343408},{"oz":1,"t":1451539383463},{"oz":6,"t":1451552407169},{"oz":6,"t":1451564564627},{"oz":2,"t":1451576189146},{"oz":4,"t":1451594646973},{"oz":1,"t":1451595950493},{"oz":2,"t":1451603139415},{"oz":2,"t":1451609875410},{"oz":4,"t":1451615104682},{"oz":4,"t":1451626588319},{"oz":6,"t":1451640652483},{"oz":4,"t":1451655583292},{"oz":3,"t":1451670005793},{"oz":2,"t":1451677148758},{"oz":2,"t":1451684756895},{"oz":2,"t":1451688647035},{"oz":2,"t":1451694197950},{"oz":2,"t":1451694618025},{"oz":4,"t":1451698696561},{"oz":2,"t":1451705323602},{"oz":6,"t":1451711220770},{"oz":6,"t":1451722692803},{"oz":6,"t":1451740950460},{"oz":4,"t":1451753854817},{"oz":5,"t":1451762820084},{"oz":2,"t":1451767098033},{"oz":4,"t":1451772274793},{"oz":3,"t":1451779653411},{"oz":1,"t":1451783625660},{"oz":4,"t":1451790167311},{"oz":3,"t":1451796529634},{"oz":4,"t":1451801370887},{"oz":2,"t":1451802818805},{"oz":6,"t":1451810803803},{"oz":4,"t":1451828229262},{"oz":4,"t":1451838661273},{"oz":4,"t":1451847657733},{"oz":4,"t":1451859807352},{"oz":2,"t":1451867460822},{"oz":4,"t":1451872678788},{"oz":6,"t":1451882562988},{"oz":6,"t":1451897998774},{"oz":3,"t":1451913276176},{"oz":3,"t":1451925775237},{"oz":3,"t":1451936317534},{"oz":1,"t":1451942310664},{"oz":4,"t":1451954440473},{"oz":3,"t":1451961763355},{"oz":4,"t":1451964976523},{"oz":2,"t":1451967071362},{"oz":2,"t":1451971324431},{"oz":6,"t":1451980379537},{"oz":3,"t":1451998857881},{"oz":3,"t":1452009449171},{"oz":4,"t":1452017611500},{"oz":4,"t":1452022422052},{"oz":1,"t":1452031383723},{"oz":4,"t":1452037466075},{"oz":2,"t":1452041428277},{"oz":6,"t":1452050746206},{"oz":4,"t":1452055612826},{"oz":5,"t":1452070597856},{"oz":2,"t":1452081621895},{"oz":2,"t":1452097606280},{"oz":2,"t":1452106870079},{"oz":2,"t":1452110905189},{"oz":4,"t":1452117158605},{"oz":4,"t":1452125817971},{"oz":4,"t":1452130005118},{"oz":4,"t":1452137934182},{"oz":1,"t":1452138619825},{"oz":6,"t":1452143887681},{"oz":6,"t":1452157632239},{"oz":3,"t":1452175437720},{"oz":4,"t":1452183308707},{"oz":3,"t":1452192131260},{"oz":2,"t":1452197641588},{"oz":2,"t":1452207674558},{"oz":2,"t":1452210756589},{"oz":4,"t":1452218458031},{"oz":1,"t":1452223994589},{"oz":4,"t":1452228359836},{"oz":2,"t":1452231910909},{"oz":6,"t":1452239500868},{"oz":3,"t":1452246438867},{"oz":4,"t":1452253820837},{"oz":2,"t":1452261071440},{"oz":1,"t":1452271460492},{"oz":1,"t":1452274109365},{"oz":2,"t":1452280068641},{"oz":2,"t":1452287179806},{"oz":2,"t":1452290501260},{"oz":4,"t":1452293193705},{"oz":2,"t":1452293456086},{"oz":2,"t":1452300745485},{"oz":4,"t":1452306174361},{"oz":4,"t":1452311378150},{"oz":2,"t":1452314455936},{"oz":6,"t":1452325181431},{"oz":6,"t":1452335084355},{"oz":3,"t":1452346610020},{"oz":1,"t":1452357877110},{"oz":1,"t":1452365638756},{"oz":2,"t":1452369187518},{"oz":2,"t":1452375744831},{"oz":4,"t":1452385638505},{"oz":4,"t":1452391501411},{"oz":2,"t":1452399393457},{"oz":6,"t":1452409747269},{"oz":2,"t":1452421043001},{"oz":4,"t":1452432885095},{"oz":2,"t":1452443151194},{"oz":2,"t":1452452529649},{"oz":2,"t":1452457930918},{"oz":1,"t":1452463327054},{"oz":2,"t":1452471744715},{"oz":2,"t":1452478844379},{"oz":4,"t":1452488441358},{"oz":2,"t":1452488966451},{"oz":4,"t":1452503946415},{"oz":4,"t":1452520967104},{"oz":1,"t":1452537597085},{"oz":1,"t":1452540021964},{"oz":2,"t":1452545464789},{"oz":2,"t":1452550835547},{"oz":2,"t":1452556441873},{"oz":2,"t":1452567163196},{"oz":2,"t":1452567347344},{"oz":2,"t":1452567541369},{"oz":4,"t":1452572618530},{"oz":4,"t":1452581901887},{"oz":4,"t":1452591845305},{"oz":4,"t":1452602948150},{"oz":3,"t":1452614071480},{"oz":2,"t":1452623025074},{"oz":2,"t":1452627942726},{"oz":3,"t":1452640484592},{"oz":2,"t":1452648918799},{"oz":2,"t":1452657371936},{"oz":2,"t":1452661022501},{"oz":4,"t":1452671384404},{"oz":5,"t":1452682968392},{"oz":2,"t":1452691841324},{"oz":3,"t":1452702675596},{"oz":2,"t":1452710996446},{"oz":2,"t":1452716107185},{"oz":2,"t":1452722963360},{"oz":2,"t":1452733152491},{"oz":2,"t":1452741995885},{"oz":2,"t":1452745139116},{"oz":2,"t":1452745247191},{"oz":2,"t":1452749746865},{"oz":2,"t":1452750153939},{"oz":2,"t":1452759046255},{"oz":4,"t":1452769123311},{"oz":3,"t":1452781371908},{"oz":2,"t":1452789854574},{"oz":2,"t":1452801518077},{"oz":2,"t":1452802665536},{"oz":2,"t":1452812354448},{"oz":2,"t":1452816081549},{"oz":2,"t":1452816465461},{"oz":4,"t":1452824350741},{"oz":2,"t":1452828458774},{"oz":4,"t":1452842965300},{"oz":4,"t":1452855780855},{"oz":2,"t":1452870033450},{"oz":2,"t":1452873636589},{"oz":2,"t":1452881987627},{"oz":2,"t":1452887612828},{"oz":2,"t":1452897320646},{"oz":4,"t":1452901001400},{"oz":2,"t":1452910652697},{"oz":2,"t":1452913175622},{"oz":4,"t":1452919951820},{"oz":1,"t":1452920479612},{"oz":6,"t":1452934456501},{"oz":4,"t":1452946677010},{"oz":2,"t":1452954477435},{"oz":1,"t":1452962156074},{"oz":1,"t":1452963272913},{"oz":4,"t":1452972450663},{"oz":2,"t":1452978426884},{"oz":2,"t":1452982389648},{"oz":2,"t":1452991573031},{"oz":2,"t":1452995650005},{"oz":2,"t":1453000521179},{"oz":2,"t":1453001790679},{"oz":6,"t":1453011051077},{"oz":6,"t":1453025051822},{"oz":2,"t":1453037307665},{"oz":2,"t":1453046482575},{"oz":2,"t":1453049723134},{"oz":2,"t":1453051443894},{"oz":2,"t":1453060059509},{"oz":4,"t":1453067207942},{"oz":2,"t":1453070988098},{"oz":1,"t":1453075879300},{"oz":2,"t":1453079695466},{"oz":4,"t":1453084391593},{"oz":1,"t":1453090569751},{"oz":2,"t":1453094726085},{"oz":5,"t":1453102533142},{"oz":4,"t":1453115059620},{"oz":4,"t":1453124140127},{"oz":2,"t":1453135230239},{"oz":3,"t":1453143063968},{"oz":1,"t":1453150199847},{"oz":2,"t":1453155614608},{"oz":4,"t":1453162002014},{"oz":2,"t":1453168165228},{"oz":2,"t":1453168793078},{"oz":2,"t":1453175278709},{"oz":2,"t":1453175714257},{"oz":4,"t":1453180356820},{"oz":6,"t":1453194167865},{"oz":3,"t":1453206105948},{"oz":4,"t":1453221811986},{"oz":2,"t":1453226896085},{"oz":4,"t":1453235036700},{"oz":3,"t":1453242253437},{"oz":2,"t":1453248385425},{"oz":4,"t":1453252478977},{"oz":5,"t":1453262359191},{"oz":4,"t":1453270181493},{"oz":6,"t":1453278279255},{"oz":3,"t":1453284053297},{"oz":4,"t":1453297483626},{"oz":2,"t":1453304905525},{"oz":1,"t":1453305010726},{"oz":2,"t":1453312436911},{"oz":4,"t":1453318585678},{"oz":3,"t":1453322601739},{"oz":3,"t":1453328626883},{"oz":2,"t":1453336147650},{"oz":4,"t":1453339102753},{"oz":3,"t":1453344996436},{"oz":2,"t":1453347511889},{"oz":2,"t":1453351194358},{"oz":2,"t":1453351815857},{"oz":6,"t":1453366304108},{"oz":5,"t":1453376010099},{"oz":1,"t":1453393244117},{"oz":2,"t":1453394768538},{"oz":4,"t":1453400078384},{"oz":2,"t":1453410119588},{"oz":2,"t":1453414265182},{"oz":2,"t":1453414532621},{"oz":4,"t":1453418025276},{"oz":1,"t":1453428159695},{"oz":4,"t":1453431719254},{"oz":5,"t":1453435784687},{"oz":3,"t":1453441632522},{"oz":6,"t":1453451423936},{"oz":4,"t":1453457800847},{"oz":4,"t":1453465749899},{"oz":2,"t":1453476072781},{"oz":2,"t":1453477867750},{"oz":2,"t":1453488453826},{"oz":4,"t":1453499762236},{"oz":4,"t":1453515285713},{"oz":2,"t":1453517871299},{"oz":1,"t":1453518381623},{"oz":2,"t":1453519929996},{"oz":6,"t":1453531788085},{"oz":6,"t":1453544903366},{"oz":4,"t":1453556548792},{"oz":4,"t":1453562741071},{"oz":4,"t":1453569717728},{"oz":4,"t":1453578033368},{"oz":3,"t":1453579867381},{"oz":2,"t":1453585317572},{"oz":2,"t":1453598414427},{"oz":2,"t":1453598638871},{"oz":4,"t":1453603247406},{"oz":2,"t":1453603942060},{"oz":2,"t":1453604230277},{"oz":4,"t":1453616404807},{"oz":6,"t":1453628145566},{"oz":4,"t":1453636236613},{"oz":1,"t":1453648173722},{"oz":1,"t":1453648580068},{"oz":4,"t":1453651785517},{"oz":1,"t":1453658615810},{"oz":1,"t":1453659555369},{"oz":4,"t":1453662440036},{"oz":1,"t":1453668554422},{"oz":1,"t":1453669606361},{"oz":4,"t":1453670435840},{"oz":4,"t":1453675909104},{"oz":4,"t":1453688795934},{"oz":2,"t":1453691321698},{"oz":6,"t":1453703744471},{"oz":4,"t":1453717552116},{"oz":4,"t":1453726607301},{"oz":1,"t":1453735282092},{"oz":4,"t":1453743085714},{"oz":4,"t":1453748148957},{"oz":2,"t":1453751571711},{"oz":2,"t":1453762140878},{"oz":5,"t":1453766494081},{"oz":4,"t":1453772447235},{"oz":4,"t":1453787506669},{"oz":6,"t":1453795465744},{"oz":4,"t":1453778315928},{"oz":4,"t":1453803631694},{"oz":4,"t":1453812070657},{"oz":4,"t":1453826755135},{"oz":4,"t":1453831947474},{"oz":1,"t":1453832240256},{"oz":4,"t":1453842632725},{"oz":1,"t":1453851380978},{"oz":4,"t":1453856432210},{"oz":4,"t":1453859562766},{"oz":2,"t":1453862993273},{"oz":4,"t":1453866037384},{"oz":6,"t":1453873752494},{"oz":6,"t":1453884421929},{"oz":3,"t":1453891575497},{"oz":4,"t":1453900344478},{"oz":4,"t":1453909342958},{"oz":4,"t":1453914174176},{"oz":2,"t":1453917361837},{"oz":2,"t":1453922741909},{"oz":2,"t":1453933549763},{"oz":2,"t":1453933830665},{"oz":6,"t":1453945515111},{"oz":4,"t":1453952928508},{"oz":2,"t":1453960382333},{"oz":4,"t":1453966449402},{"oz":4,"t":1453973417705},{"oz":4,"t":1453987442229},{"oz":3,"t":1453991235419},{"oz":4,"t":1454002754843},{"oz":4,"t":1454006061644},{"oz":2,"t":1454009421300},{"oz":2,"t":1454015273276},{"oz":2,"t":1454020576670},{"oz":4,"t":1454025397388},{"oz":4,"t":1454035652025},{"oz":4,"t":1454045892281},{"oz":3,"t":1454054712423},{"oz":4,"t":1454062020386},{"oz":4,"t":1454074882408},{"oz":2,"t":1454084384760},{"oz":4,"t":1454089684520},{"oz":2,"t":1454101929765},{"oz":4,"t":1454104217349},{"oz":2,"t":1454112583289},{"oz":6,"t":1454122079977},{"oz":4,"t":1454125820026},{"oz":4,"t":1454131058674},{"oz":3,"t":1454136978038},{"oz":2,"t":1454140056737},{"oz":5,"t":1454145595526},{"oz":1,"t":1454152420844},{"oz":3,"t":1454164284221},{"oz":1,"t":1454170687779},{"oz":2,"t":1454176523618},{"oz":2,"t":1454180607084},{"oz":2,"t":1454190026051},{"oz":2,"t":1454195205870},{"oz":4,"t":1454203770162},{"oz":4,"t":1454208137031},{"oz":4,"t":1454212419182},{"oz":2,"t":1454225622073},{"oz":3,"t":1454219698281},{"oz":4,"t":1454234766792},{"oz":4,"t":1454243977197},{"oz":1,"t":1454252882038},{"oz":2,"t":1454257208184},{"oz":2,"t":1454264466411},{"oz":4,"t":1454269354734},{"oz":3,"t":1454278406862},{"oz":4,"t":1454282802072},{"oz":2,"t":1454287169486},{"oz":4,"t":1454294768636},{"oz":4,"t":1454298826840},{"oz":4,"t":1454301537654},{"oz":2,"t":1454304744822},{"oz":2,"t":1454308857134},{"oz":1,"t":1454313109742},{"oz":4,"t":1454316661360},{"oz":4,"t":1454323025484},{"oz":4,"t":1454333600366},{"oz":1,"t":1454343268902},{"oz":4,"t":1454346829424},{"oz":2,"t":1454353996334},{"oz":4,"t":1454359532578},{"oz":2,"t":1454363430020},{"oz":2,"t":1454371387531},{"oz":2,"t":1454371534144},{"oz":4,"t":1454373316125},{"oz":4,"t":1454377206662},{"oz":4,"t":1454384217177},{"oz":4,"t":1454394012107},{"oz":2,"t":1454400535621},{"oz":4,"t":1454410095825},{"oz":4,"t":1454417779832},{"oz":3,"t":1454426664729},{"oz":3,"t":1454436020284},{"oz":2,"t":1454442827481},{"oz":2,"t":1454453115460},{"oz":3,"t":1454455930422},{"oz":4,"t":1454466707683},{"oz":2,"t":1454466897458},{"oz":4,"t":1454476591490},{"oz":2,"t":1454471872795},{"oz":4,"t":1454481554099},{"oz":4,"t":1454488812995},{"oz":6,"t":1454500554662},{"oz":4,"t":1454515698246},{"oz":2,"t":1454521435276},{"oz":4,"t":1454530746474},{"oz":4,"t":1454538989088},{"oz":4,"t":1454545486421},{"oz":2,"t":1454550524568},{"oz":4,"t":1454556235314},{"oz":1,"t":1454555709988},{"oz":5,"t":1454560497504},{"oz":6,"t":1454570899579},{"oz":1,"t":1454576949478},{"oz":4,"t":1454581725814},{"oz":4,"t":1454595275176},{"oz":2,"t":1454604802502},{"oz":4,"t":1454613395922},{"oz":2,"t":1454621983245},{"oz":4,"t":1454632078155},{"oz":2,"t":1454639074395},{"oz":4,"t":1454641445874},{"oz":4,"t":1454645357866},{"oz":4,"t":1454649949102},{"oz":6,"t":1454658070087},{"oz":4,"t":1454663005004},{"oz":1,"t":1454671790958},{"oz":4,"t":1454682527300},{"oz":4,"t":1454694530565},{"oz":4,"t":1454707434837},{"oz":4,"t":1454726649996},{"oz":1,"t":1454717660560},{"oz":6,"t":1454710473534},{"oz":3,"t":1454738662802},{"oz":3,"t":1454738679781},{"oz":3,"t":1454745888696},{"oz":4,"t":1454753110180},{"oz":3,"t":1454760302403},{"oz":4,"t":1454768689588},{"oz":2,"t":1454774778747},{"oz":4,"t":1454786246603},{"oz":2,"t":1454791746715},{"oz":2,"t":1454790613857},{"oz":6,"t":1454806056773},{"oz":4,"t":1454814180747},{"oz":6,"t":1454832431953},{"oz":4,"t":1454844062560},{"oz":6,"t":1454860266578},{"oz":4,"t":1454869504141},{"oz":1,"t":1454879661525},{"oz":4,"t":1454891737189},{"oz":2,"t":1454902942949},{"oz":6,"t":1454910122361},{"oz":4,"t":1454915293649},{"oz":1,"t":1454945386224},{"oz":6,"t":1455012885227},{"oz":4,"t":1455028164742},{"oz":4,"t":1454957992527},{"oz":4,"t":1454968810048},{"oz":4,"t":1454978615938},{"oz":4,"t":1454992452038},{"oz":4,"t":1455036094692},{"oz":4,"t":1455050259091},{"oz":4,"t":1455057405264},{"oz":4,"t":1455068860110},{"oz":4,"t":1455074908998},{"oz":2,"t":1455079268570},{"oz":6,"t":1455082928623},{"oz":6,"t":1455092342598},{"oz":6,"t":1455104833999},{"oz":4,"t":1455112829865},{"oz":2,"t":1455122627185},{"oz":2,"t":1455130343782},{"oz":4,"t":1455136950989},{"oz":4,"t":1455144993186},{"oz":4,"t":1455147095025},{"oz":2,"t":1455152383679},{"oz":4,"t":1455159435848},{"oz":3,"t":1455165746825},{"oz":4,"t":1455172507351},{"oz":4,"t":1455177346835},{"oz":4,"t":1455183292517},{"oz":4,"t":1455190870082},{"oz":2,"t":1455200609118},{"oz":4,"t":1455215426661},{"oz":4,"t":1455220720142},{"oz":3,"t":1455229684406},{"oz":4,"t":1455232617501},{"oz":3,"t":1455243697279},{"oz":4,"t":1455246748586},{"oz":2,"t":1455248481425},{"oz":6,"t":1455253500969},{"oz":6,"t":1455262694439},{"oz":6,"t":1455270696843},{"oz":4,"t":1455276150674},{"oz":4,"t":1455288662947},{"oz":5,"t":1455310154354},{"oz":3,"t":1455313339026},{"oz":1,"t":1455322662283},{"oz":4,"t":1455325673643},{"oz":1,"t":1455334173470},{"oz":4,"t":1455338340812},{"oz":4,"t":1455338949765},{"oz":3,"t":1455347347081},{"oz":2,"t":1455355542307},{"oz":4,"t":1455362776314},{"oz":4,"t":1455377793498},{"oz":2,"t":1455385008241},{"oz":4,"t":1455388940655},{"oz":4,"t":1455398520353},{"oz":2,"t":1455402598285},{"oz":1,"t":1455409797239},{"oz":3,"t":1455410419061},{"oz":4,"t":1455421089285},{"oz":4,"t":1455425703376},{"oz":2,"t":1455426116086},{"oz":4,"t":1455433726200},{"oz":4,"t":1455440504844},{"oz":4,"t":1455462818678},{"oz":1,"t":1455470205548},{"oz":3,"t":1455471772079},{"oz":1,"t":1455477264592},{"oz":2,"t":1455485571607},{"oz":4,"t":1455487491631},{"oz":2,"t":1455487956731},{"oz":4,"t":1455495254457},{"oz":4,"t":1455501237219},{"oz":1,"t":1455501605490},{"oz":4,"t":1455507945570},{"oz":3,"t":1455513080335},{"oz":4,"t":1455521939457},{"oz":3,"t":1455530169633},{"oz":4,"t":1455535634266},{"oz":3,"t":1455549143016},{"oz":1,"t":1455555707458},{"oz":1,"t":1455558101716},{"oz":4,"t":1455563550382},{"oz":3,"t":1455574618926},{"oz":4,"t":1455586697446},{"oz":6,"t":1455597053997},{"oz":4,"t":1455600975544},{"oz":6,"t":1455609267642},{"oz":6,"t":1455620649815},{"oz":4,"t":1455633841479},{"oz":1,"t":1455641219948},{"oz":4,"t":1455645337560},{"oz":2,"t":1455650255383},{"oz":4,"t":1455656862670},{"oz":4,"t":1455663706728},{"oz":2,"t":1455663971435},{"oz":2,"t":1455674689578},{"oz":4,"t":1455680598665},{"oz":5,"t":1455687591011},{"oz":4,"t":1455699519499},{"oz":6,"t":1455717813373},{"oz":4,"t":1455724033290},{"oz":4,"t":1455740195600},{"oz":4,"t":1455754771191},{"oz":3,"t":1455762790289},{"oz":4,"t":1455767486691},{"oz":2,"t":1455767749568},{"oz":6,"t":1455775285738},{"oz":6,"t":1455784587539},{"oz":4,"t":1455798196388},{"oz":4,"t":1455810743976},{"oz":4,"t":1455818491087},{"oz":4,"t":1455823999985},{"oz":4,"t":1455838286081},{"oz":2,"t":1455840986285},{"oz":6,"t":1455846458204},{"oz":6,"t":1455853290480},{"oz":2,"t":1455858253516},{"oz":4,"t":1455866906526},{"oz":4,"t":1455875536874},{"oz":4,"t":1455890361282},{"oz":1,"t":1455896556256},{"oz":2,"t":1455898579456},{"oz":2,"t":1455915059870},{"oz":4,"t":1455923410151},{"oz":2,"t":1455926968315},{"oz":2,"t":1455929200788},{"oz":6,"t":1455944731353},{"oz":2,"t":1455948746647},{"oz":4,"t":1455959887993},{"oz":4,"t":1455974923647},{"oz":5,"t":1455985128287},{"oz":2,"t":1455991765330},{"oz":4,"t":1455998864378},{"oz":4,"t":1456010680622},{"oz":6,"t":1456018050722},{"oz":4,"t":1456024515708},{"oz":6,"t":1456034989502},{"oz":6,"t":1456042967100},{"oz":4,"t":1456056456562},{"oz":4,"t":1456065617175},{"oz":4,"t":1456075799392},{"oz":2,"t":1456079191776},{"oz":3,"t":1456085569311},{"oz":4,"t":1456094536763},{"oz":6,"t":1456107304706},{"oz":6,"t":1456119518900},{"oz":6,"t":1456143134705},{"oz":4,"t":1456149239726},{"oz":1,"t":1456158789797},{"oz":2,"t":1456165051167},{"oz":4,"t":1456179100934},{"oz":2,"t":1456171386397},{"oz":6,"t":1456183198198},{"oz":6,"t":1456193459907},{"oz":4,"t":1456199848924},{"oz":6,"t":1456206584812},{"oz":4,"t":1456212730549},{"oz":6,"t":1456220177781},{"oz":4,"t":1456231468596},{"oz":4,"t":1456244588722},{"oz":6,"t":1456254995272},{"oz":2,"t":1456267089744},{"oz":4,"t":1456269297072},{"oz":5,"t":1456277921417},{"oz":4,"t":1456282555674},{"oz":4,"t":1456295007148},{"oz":6,"t":1456308936341},{"oz":4,"t":1456316913849},{"oz":3,"t":1456327303477},{"oz":4,"t":1456333546749},{"oz":4,"t":1456344396379},{"oz":6,"t":1456355172565},{"oz":4,"t":1456363969577},{"oz":4,"t":1456367515269},{"oz":4,"t":1456369756581},{"oz":4,"t":1456373834604},{"oz":6,"t":1456384021128},{"oz":6,"t":1456394669383},{"oz":4,"t":1456401278675},{"oz":4,"t":1456414115503},{"oz":6,"t":1456419239143},{"oz":6,"t":1456434209382},{"oz":5,"t":1456449216756},{"oz":4,"t":1456452767565},{"oz":4,"t":1456456488476},{"oz":6,"t":1456465347133},{"oz":4,"t":1456471077848},{"oz":6,"t":1456479511959},{"oz":4,"t":1456490358800},{"oz":4,"t":1456500359379},{"oz":4,"t":1456505876632},{"oz":4,"t":1456513284528},{"oz":4,"t":1456522444637},{"oz":4,"t":1456526412799},{"oz":4,"t":1456533247811},{"oz":1,"t":1456543095945},{"oz":1,"t":1456543205631},{"oz":5,"t":1456544369990},{"oz":1,"t":1456549111510},{"oz":4,"t":1456553858307},{"oz":4,"t":1456558910474},{"oz":4,"t":1456565328817},{"oz":4,"t":1456574871624},{"oz":4,"t":1456585222053},{"oz":1,"t":1456599993336},{"oz":4,"t":1456602574597},{"oz":4,"t":1456610848631},{"oz":3,"t":1456616036370},{"oz":4,"t":1456623642079},{"oz":4,"t":1456629470093},{"oz":4,"t":1456636289993},{"oz":4,"t":1456637837393},{"oz":4,"t":1456641510777},{"oz":6,"t":1456648426844},{"oz":3,"t":1456655878153},{"oz":6,"t":1456663172167},{"oz":4,"t":1456677763188},{"oz":4,"t":1456682108020},{"oz":4,"t":1456686587576},{"oz":2,"t":1456687141150},{"oz":5,"t":1456694514500},{"oz":1,"t":1456702040236},{"oz":2,"t":1456704252292},{"oz":4,"t":1456715258478},{"oz":6,"t":1456721246463},{"oz":4,"t":1456727146329},{"oz":3,"t":1456730118213},{"oz":5,"t":1456739190647},{"oz":4,"t":1456744075538},{"oz":6,"t":1456753991818},{"oz":4,"t":1456764796485},{"oz":4,"t":1456771088717},{"oz":6,"t":1456778015557},{"oz":6,"t":1456789912279},{"oz":3,"t":1456804642126},{"oz":5,"t":1456815491526},{"oz":6,"t":1456820686195},{"oz":6,"t":1456835055450},{"oz":6,"t":1456848550387},{"oz":1,"t":1456855258839},{"oz":4,"t":1456861286740},{"oz":6,"t":1456878062246},{"oz":2,"t":1456870902315},{"oz":4,"t":1456883309803},{"oz":4,"t":1456883812246},{"oz":6,"t":1456891541382},{"oz":6,"t":1456898173653},{"oz":4,"t":1456900993129},{"oz":2,"t":1456902059291},{"oz":6,"t":1456904817510},{"oz":6,"t":1456916861866},{"oz":2,"t":1456916864569},{"oz":6,"t":1456926966921},{"oz":3,"t":1456936374360},{"oz":2,"t":1456952761839},{"oz":6,"t":1456961687106},{"oz":2,"t":1456972592463},{"oz":5,"t":1456970962217},{"oz":6,"t":1456986681170},{"oz":2,"t":1456986684406},{"oz":6,"t":1456996681192},{"oz":2,"t":1456996684039},{"oz":6,"t":1457006104925},{"oz":3,"t":1457019701676},{"oz":4,"t":1457029656856},{"oz":4,"t":1457035031464},{"oz":5,"t":1457047167954},{"oz":5,"t":1457057194073},{"oz":4,"t":1457072981513},{"oz":4,"t":1457072994246},{"oz":3,"t":1457079026459},{"oz":4,"t":1457091026640},{"oz":4,"t":1457091030325},{"oz":3,"t":1457103388070},{"oz":1,"t":1457107605975},{"oz":1,"t":1457109344954},{"oz":6,"t":1457114473885},{"oz":3,"t":1457122260914},{"oz":2,"t":1457135352889},{"oz":5,"t":1457137657763},{"oz":5,"t":1457150954311},{"oz":6,"t":1457158537924},{"oz":4,"t":1457163105568},{"oz":6,"t":1457173491921},{"oz":6,"t":1457186790337},{"oz":2,"t":1457195060520},{"oz":4,"t":1457200010730},{"oz":4,"t":1457220436251},{"oz":2,"t":1457216312018},{"oz":3,"t":1457232153658},{"oz":6,"t":1457243868908},{"oz":6,"t":1457253157102},{"oz":6,"t":1457262033263},{"oz":4,"t":1457271510704},{"oz":1,"t":1457280160504},{"oz":1,"t":1457282323561},{"oz":1,"t":1457290692232},{"oz":4,"t":1457293198837},{"oz":4,"t":1457297996331},{"oz":2,"t":1457298902097},{"oz":4,"t":1457312556261},{"oz":2,"t":1457313740611},{"oz":6,"t":1457325271190},{"oz":6,"t":1457333707566},{"oz":6,"t":1457338272248},{"oz":6,"t":1457347461657},{"oz":6,"t":1457358098994},{"oz":1,"t":1457367652606},{"oz":6,"t":1457383855110},{"oz":4,"t":1457391580619},{"oz":3,"t":1457402598095},{"oz":4,"t":1457407097217},{"oz":3,"t":1457416946676},{"oz":3,"t":1457426276620},{"oz":6,"t":1457437575661},{"oz":6,"t":1457450996534},{"oz":2,"t":1457455218568},{"oz":4,"t":1457478233514},{"oz":4,"t":1457483041198},{"oz":4,"t":1457491165531},{"oz":4,"t":1457495564796},{"oz":6,"t":1457513872404},{"oz":6,"t":1457537625279},{"oz":4,"t":1457543562246},{"oz":4,"t":1457550663040},{"oz":4,"t":1457554249889},{"oz":6,"t":1457564228654},{"oz":4,"t":1457569148849},{"oz":3,"t":1457581703551},{"oz":5,"t":1457592184663},{"oz":5,"t":1457600913605},{"oz":3,"t":1457616775787},{"oz":1,"t":1457622375033},{"oz":2,"t":1457632824308},{"oz":3,"t":1457641700628},{"oz":4,"t":1457647373631},{"oz":6,"t":1457665004907},{"oz":2,"t":1457671065544},{"oz":3,"t":1457681142725},{"oz":3,"t":1457699009602},{"oz":2,"t":1457709526462},{"oz":4,"t":1457713990986},{"oz":2,"t":1457717657831},{"oz":2,"t":1457729874432},{"oz":4,"t":1457738360211},{"oz":5,"t":1457741957868},{"oz":4,"t":1457752354544},{"oz":6,"t":1457752347841},{"oz":6,"t":1457764845175},{"oz":6,"t":1457774574048},{"oz":6,"t":1457792213909},{"oz":2,"t":1457797056395},{"oz":2,"t":1457798093443},{"oz":4,"t":1457808786551},{"oz":4,"t":1457826557600},{"oz":4,"t":1457838984138},{"oz":2,"t":1457839292766},{"oz":6,"t":1457850986406},{"oz":2,"t":1457850989024},{"oz":5,"t":1457857409572},{"oz":5,"t":1457869696064},{"oz":4,"t":1457883174793},{"oz":4,"t":1457889099033},{"oz":4,"t":1457899119624},{"oz":2,"t":1457899343641},{"oz":5,"t":1457907552116},{"oz":2,"t":1457921877697},{"oz":5,"t":1457938382260},{"oz":6,"t":1457949409164},{"oz":6,"t":1457963225292},{"oz":4,"t":1457969526653},{"oz":4,"t":1457975484158},{"oz":6,"t":1457990473115},{"oz":2,"t":1457992031396},{"oz":6,"t":1458005071950},{"oz":6,"t":1458011095370},{"oz":5,"t":1458021326567},{"oz":6,"t":1458045770023},{"oz":6,"t":1458057694783},{"oz":5,"t":1458073279327},{"oz":4,"t":1458076984131},{"oz":4,"t":1458085010699},{"oz":6,"t":1458088771532},{"oz":6,"t":1458098337456},{"oz":4,"t":1458113858567},{"oz":6,"t":1458136823124},{"oz":4,"t":1458142343752},{"oz":6,"t":1458156524227},{"oz":6,"t":1458164455699},{"oz":6,"t":1458182795233},{"oz":4,"t":1458189312482},{"oz":6,"t":1458196676145},{"oz":6,"t":1458206007702},{"oz":6,"t":1458219975199},{"oz":5,"t":1458230417932},{"oz":3,"t":1458236604409},{"oz":4,"t":1458246431230},{"oz":3,"t":1458254512200},{"oz":4,"t":1458258542386},{"oz":4,"t":1458265906700},{"oz":1,"t":1458267041520},{"oz":4,"t":1458271789606},{"oz":6,"t":1458277919035},{"oz":6,"t":1458281703959},{"oz":6,"t":1458298812474},{"oz":5,"t":1458315397347},{"oz":2,"t":1458327159604},{"oz":5,"t":1458338139063},{"oz":3,"t":1458344833410},{"oz":4,"t":1458347182143},{"oz":6,"t":1458358210391},{"oz":4,"t":1458366352396},{"oz":4,"t":1458375332106},{"oz":6,"t":1458389361203},{"oz":5,"t":1458400498402},{"oz":2,"t":1458416683376},{"oz":3,"t":1458428472886},{"oz":3,"t":1458429542279},{"oz":4,"t":1458434452827},{"oz":4,"t":1458441095488},{"oz":4,"t":1458441357941},{"oz":6,"t":1458450059906},{"oz":6,"t":1458464416515},{"oz":6,"t":1458479331595},{"oz":4,"t":1458489671665},{"oz":2,"t":1458494228147},{"oz":4,"t":1458503087514},{"oz":4,"t":1458508048910},{"oz":4,"t":1458515893307},{"oz":2,"t":1458521776260},{"oz":4,"t":1458526511515},{"oz":6,"t":1458536157778},{"oz":6,"t":1458544690450},{"oz":2,"t":1458559166926},{"oz":4,"t":1458571152744},{"oz":2,"t":1458575823682},{"oz":3,"t":1458586131795},{"oz":6,"t":1458597783667},{"oz":4,"t":1458602809664},{"oz":4,"t":1458621644123},{"oz":6,"t":1458626937632},{"oz":6,"t":1458639416739},{"oz":3,"t":1458651280667},{"oz":4,"t":1458667592890},{"oz":6,"t":1458677687814},{"oz":4,"t":1458687835083},{"oz":3,"t":1458692480168},{"oz":3,"t":1458699268015},{"oz":5,"t":1458702061372},{"oz":4,"t":1458709046644},{"oz":5,"t":1458717234927},{"oz":6,"t":1458728148686},{"oz":4,"t":1458741995630},{"oz":4,"t":1458748154274},{"oz":4,"t":1458756690377},{"oz":4,"t":1458761524638},{"oz":5,"t":1458771332302},{"oz":4,"t":1458781793913},{"oz":4,"t":1458787423904},{"oz":6,"t":1458792948669},{"oz":4,"t":1458797711564},{"oz":4,"t":1458809634679},{"oz":3,"t":1458814619076},{"oz":6,"t":1458825014118},{"oz":2,"t":1458833563541},{"oz":6,"t":1458839503354},{"oz":2,"t":1458849661392},{"oz":6,"t":1458857920198},{"oz":1,"t":1458865102842},{"oz":2,"t":1458872817691},{"oz":2,"t":1458874657839},{"oz":4,"t":1458882038050},{"oz":6,"t":1458889072119},{"oz":6,"t":1458899171446},{"oz":6,"t":1458912656809},{"oz":2,"t":1458926333471},{"oz":2,"t":1458944245883},{"oz":4,"t":1458945668159},{"oz":6,"t":1458959175260},{"oz":4,"t":1458962456342},{"oz":6,"t":1458974269975},{"oz":2,"t":1458974273519},{"oz":6,"t":1458982810335},{"oz":6,"t":1458988301859},{"oz":3,"t":1459004211069},{"oz":4,"t":1459010922553},{"oz":2,"t":1459013919582},{"oz":2,"t":1459024997436},{"oz":6,"t":1459030944958},{"oz":4,"t":1459048303646},{"oz":4,"t":1459050333452},{"oz":6,"t":1459052271583},{"oz":2,"t":1459059352584},{"oz":2,"t":1459059521557},{"oz":5,"t":1459067129848},{"oz":6,"t":1459072745267},{"oz":4,"t":1459087505502},{"oz":2,"t":1459093708581},{"oz":3,"t":1459106604637},{"oz":3,"t":1459113728866},{"oz":1,"t":1459126318935},{"oz":2,"t":1459131281235},{"oz":4,"t":1459135119230},{"oz":6,"t":1459146103408},{"oz":6,"t":1459154025116},{"oz":6,"t":1459170045384},{"oz":4,"t":1459179837970},{"oz":4,"t":1459188611885},{"oz":2,"t":1459199323338},{"oz":6,"t":1459207819663},{"oz":1,"t":1459216589408},{"oz":6,"t":1459224348502},{"oz":4,"t":1459234534563},{"oz":6,"t":1459241336643},{"oz":6,"t":1459254744201},{"oz":4,"t":1459265193317},{"oz":4,"t":1459268811507},{"oz":1,"t":1459273716114},{"oz":6,"t":1459282871659},{"oz":4,"t":1459290501887},{"oz":4,"t":1459302239086},{"oz":4,"t":1459306773134},{"oz":6,"t":1459319793813},{"oz":6,"t":1459327608188},{"oz":6,"t":1459334827842},{"oz":6,"t":1459343902602},{"oz":3,"t":1459352358632},{"oz":4,"t":1459357190424},{"oz":1,"t":1459364071032},{"oz":2,"t":1459372788746},{"oz":4,"t":1459379676526},{"oz":4,"t":1459387950073},{"oz":4,"t":1459391498784},{"oz":1,"t":1459394648659},{"oz":6,"t":1459399919124},{"oz":6,"t":1459411265261},{"oz":6,"t":1459418819874},{"oz":6,"t":1459426494012},{"oz":4,"t":1459438498452},{"oz":4,"t":1459442805271},{"oz":1,"t":1459443397364},{"oz":4,"t":1459453335678},{"oz":6,"t":1459468465734},{"oz":6,"t":1459480970480},{"oz":3,"t":1459485900987},{"oz":2,"t":1459493869704},{"oz":4,"t":1459497675980},{"oz":4,"t":1459510356315},{"oz":3,"t":1459522934773},{"oz":4,"t":1459529642621},{"oz":4,"t":1459533233698},{"oz":4,"t":1459544303876},{"oz":4,"t":1459551385287},{"oz":6,"t":1459559516744},{"oz":4,"t":1459566766705},{"oz":6,"t":1459574984730},{"oz":4,"t":1459583400197},{"oz":4,"t":1459594817408},{"oz":4,"t":1459605590124},{"oz":4,"t":1459614951954},{"oz":6,"t":1459630490997},{"oz":6,"t":1459636927195},{"oz":6,"t":1459647353353},{"oz":4,"t":1459653149209},{"oz":6,"t":1459664303585},{"oz":3,"t":1459668444992},{"oz":5,"t":1459675593933},{"oz":6,"t":1459688637387},{"oz":4,"t":1459697120341},{"oz":6,"t":1459712419734},{"oz":6,"t":1459724226566},{"oz":4,"t":1459732866684},{"oz":6,"t":1459740610486},{"oz":4,"t":1459745576964},{"oz":6,"t":1459760034466},{"oz":3,"t":1459778191132},{"oz":4,"t":1459781155797},{"oz":4,"t":1459787990939},{"oz":6,"t":1459796094922},{"oz":6,"t":1459807072386},{"oz":4,"t":1459811808632},{"oz":4,"t":1459821211635},{"oz":6,"t":1459828967118},{"oz":6,"t":1459836074602},{"oz":4,"t":1459844447480},{"oz":4,"t":1459856258526},{"oz":4,"t":1459870097367},{"oz":3,"t":1459884491655},{"oz":4,"t":1459888560408},{"oz":6,"t":1459895617059},{"oz":2,"t":1459910261888},{"oz":6,"t":1459903157377},{"oz":4,"t":1459912797843},{"oz":6,"t":1459926585220},{"oz":6,"t":1459942611833},{"oz":3,"t":1459951206423},{"oz":4,"t":1459955881379},{"oz":6,"t":1459967161768},{"oz":4,"t":1459974319603},{"oz":6,"t":1459981749706},{"oz":5,"t":1459987442197},{"oz":6,"t":1460003348715},{"oz":6,"t":1460009017008},{"oz":6,"t":1460030491230},{"oz":1,"t":1460030494593},{"oz":1,"t":1460038660187},{"oz":2,"t":1460040978367},{"oz":4,"t":1460047437111},{"oz":6,"t":1460054960068},{"oz":1,"t":1460054962289},{"oz":6,"t":1460061936096},{"oz":6,"t":1460068867589},{"oz":3,"t":1460073955166},{"oz":4,"t":1460085304511},{"oz":6,"t":1460095033606},{"oz":2,"t":1460095035494},{"oz":6,"t":1460107236736},{"oz":3,"t":1460123654304},{"oz":4,"t":1460129419360},{"oz":4,"t":1460137964585},{"oz":4,"t":1460150095137},{"oz":5,"t":1460160154101},{"oz":6,"t":1460164978900},{"oz":6,"t":1460180312985},{"oz":6,"t":1460194802001},{"oz":1,"t":1460194805131},{"oz":4,"t":1460209026636},{"oz":4,"t":1460216725254},{"oz":1,"t":1460217900910},{"oz":4,"t":1460222165096},{"oz":6,"t":1460229276585},{"oz":6,"t":1460240740888},{"oz":6,"t":1460255775109},{"oz":6,"t":1460265573458},{"oz":5,"t":1460269655933},{"oz":6,"t":1460277811898},{"oz":3,"t":1460299024895},{"oz":3,"t":1460302507118},{"oz":6,"t":1460315173766},{"oz":6,"t":1460324248404},{"oz":6,"t":1460329821987},{"oz":5,"t":1460338020216},{"oz":6,"t":1460342659847},{"oz":4,"t":1460346894945},{"oz":6,"t":1460360412757},{"oz":6,"t":1460382759372},{"oz":4,"t":1460391768236},{"oz":4,"t":1460402962374},{"oz":6,"t":1460419965255},{"oz":6,"t":1460426417986},{"oz":1,"t":1460426420477},{"oz":6,"t":1460435504686},{"oz":6,"t":1460448053037},{"oz":1,"t":1460448067066},{"oz":6,"t":1460460417404},{"oz":4,"t":1460473065918},{"oz":6,"t":1460485534401},{"oz":3,"t":1460492737590},{"oz":6,"t":1460499321516},{"oz":6,"t":1460512114511},{"oz":6,"t":1460524858339},{"oz":1,"t":1460524866123},{"oz":6,"t":1460536877291},{"oz":4,"t":1460548770430},{"oz":4,"t":1460556751185},{"oz":2,"t":1460564081690},{"oz":3,"t":1460576564844},{"oz":6,"t":1460583796794},{"oz":6,"t":1460592764654},{"oz":4,"t":1460597899300},{"oz":4,"t":1460598854365},{"oz":2,"t":1460599729581},{"oz":2,"t":1460600048105},{"oz":4,"t":1460615494392},{"oz":6,"t":1460622514647},{"oz":4,"t":1460635175758},{"oz":4,"t":1460645462702},{"oz":4,"t":1460649682997},{"oz":4,"t":1460663500647},{"oz":6,"t":1460674085634},{"oz":2,"t":1460682053763},{"oz":4,"t":1460686553061},{"oz":4,"t":1460687168062},{"oz":6,"t":1460710809424},{"oz":6,"t":1460722224044},{"oz":4,"t":1460732778951},{"oz":4,"t":1460738227728},{"oz":6,"t":1460772103366},{"oz":2,"t":1460780631937},{"oz":6,"t":1460791485661},{"oz":6,"t":1460804758925},{"oz":4,"t":1460816201877},{"oz":6,"t":1460834564185},{"oz":1,"t":1460846749829},{"oz":4,"t":1460850954254},{"oz":6,"t":1460862956317},{"oz":4,"t":1460870541968},{"oz":5,"t":1460881364903},{"oz":6,"t":1460892727959},{"oz":4,"t":1460902608626},{"oz":4,"t":1460909169737},{"oz":6,"t":1460919718951},{"oz":6,"t":1460928186127},{"oz":6,"t":1460937969554},{"oz":6,"t":1460944895966},{"oz":5,"t":1460958080273},{"oz":6,"t":1460974943420},{"oz":6,"t":1460987696366},{"oz":3,"t":1460994395606},{"oz":3,"t":1461001490359},{"oz":4,"t":1461012097217},{"oz":6,"t":1461023409881},{"oz":4,"t":1461030532989},{"oz":6,"t":1461040473827},{"oz":6,"t":1461045706895},{"oz":2,"t":1461045709041},{"oz":6,"t":1461061309899},{"oz":6,"t":1461071701198},{"oz":4,"t":1461078234144},{"oz":4,"t":1461085344938},{"oz":2,"t":1461102015819},{"oz":4,"t":1461105021711},{"oz":4,"t":1461110886464},{"oz":6,"t":1461118711662},{"oz":4,"t":1461119257431},{"oz":2,"t":1461130301197},{"oz":4,"t":1461140133336},{"oz":6,"t":1461147111862},{"oz":3,"t":1461163998682},{"oz":3,"t":1461165613782},{"oz":4,"t":1461170767910},{"oz":4,"t":1461183618407},{"oz":6,"t":1461190606331},{"oz":4,"t":1461199610101},{"oz":4,"t":1461199662098},{"oz":4,"t":1461204305682},{"oz":3,"t":1461215648148},{"oz":6,"t":1461228142943},{"oz":6,"t":1461242322100},{"oz":4,"t":1461252069549},{"oz":2,"t":1461255177399},{"oz":4,"t":1461261443942},{"oz":2,"t":1461270718565},{"oz":4,"t":1461276748369},{"oz":6,"t":1461286096924},{"oz":4,"t":1461291508726},{"oz":4,"t":1461293078773},{"oz":6,"t":1461304947913},{"oz":6,"t":1461312708239},{"oz":6,"t":1461323608358},{"oz":4,"t":1461333972486},{"oz":3,"t":1461342434807},{"oz":4,"t":1461347403345},{"oz":6,"t":1461355233533},{"oz":2,"t":1461361740974},{"oz":4,"t":1461361945037},{"oz":4,"t":1461367487125},{"oz":6,"t":1461376952294},{"oz":4,"t":1461378216705},{"oz":6,"t":1461386650259},{"oz":5,"t":1461395644484},{"oz":6,"t":1461407160369},{"oz":6,"t":1461416055024},{"oz":1,"t":1461423453660},{"oz":3,"t":1461424255542},{"oz":4,"t":1461429579246},{"oz":3,"t":1461442458373},{"oz":3,"t":1461443009375},{"oz":3,"t":1461451064141},{"oz":2,"t":1461453345968},{"oz":6,"t":1461461835342},{"oz":4,"t":1461462978799},{"oz":6,"t":1461482412025},{"oz":6,"t":1461494381732},{"oz":6,"t":1461502581127},{"oz":1,"t":1461511485446},{"oz":4,"t":1461514692983},{"oz":6,"t":1461538809920},{"oz":4,"t":1461544964899},{"oz":4,"t":1461548772549},{"oz":4,"t":1461520866250},{"oz":6,"t":1461560520815},{"oz":6,"t":1461577126889},{"oz":6,"t":1461594112176},{"oz":6,"t":1461602395316},{"oz":6,"t":1461612484282},{"oz":3,"t":1461620704482},{"oz":4,"t":1461625618552},{"oz":1,"t":1461632116607},{"oz":3,"t":1461635002754},{"oz":4,"t":1461637349617},{"oz":6,"t":1461657074833},{"oz":6,"t":1461668588469},{"oz":6,"t":1461678655810},{"oz":4,"t":1461681713863},{"oz":2,"t":1461686080230},{"oz":4,"t":1461701299816},{"oz":2,"t":1461701519244},{"oz":6,"t":1461716815327},{"oz":6,"t":1461732880413},{"oz":6,"t":1461749949293},{"oz":6,"t":1461761328602},{"oz":4,"t":1461771032911},{"oz":6,"t":1461780589852},{"oz":6,"t":1461788316529},{"oz":6,"t":1461804965502},{"oz":4,"t":1461807488773},{"oz":6,"t":1461827787351},{"oz":6,"t":1461842877413},{"oz":4,"t":1461856112168},{"oz":6,"t":1461868486754},{"oz":4,"t":1461875077311},{"oz":4,"t":1461879527276},{"oz":4,"t":1461889603981},{"oz":6,"t":1461897432990},{"oz":6,"t":1461907847279},{"oz":2,"t":1461907851590},{"oz":6,"t":1461920847181},{"oz":6,"t":1461934680026},{"oz":3,"t":1461947336758},{"oz":6,"t":1461954240441},{"oz":6,"t":1461965266697},{"oz":6,"t":1461977586700},{"oz":2,"t":1461979022918},{"oz":2,"t":1461981008877},{"oz":4,"t":1461983217809},{"oz":6,"t":1462002291821},{"oz":6,"t":1462018713313},{"oz":6,"t":1462024940962},{"oz":6,"t":1462036029083},{"oz":2,"t":1462047525584},{"oz":6,"t":1462065637580},{"oz":6,"t":1462069653060},{"oz":6,"t":1462084881035},{"oz":1,"t":1462084882683},{"oz":6,"t":1462095918249},{"oz":6,"t":1462112347579},{"oz":1,"t":1462115664304},{"oz":2,"t":1462116375203},{"oz":2,"t":1462129756896},{"oz":5,"t":1462134267812},{"oz":2,"t":1462138428615},{"oz":1,"t":1462150256831},{"oz":2,"t":1462150844619},{"oz":4,"t":1462153436783},{"oz":6,"t":1462160266972},{"oz":6,"t":1462185250275},{"oz":2,"t":1462199589117},{"oz":4,"t":1462208983662},{"oz":3,"t":1462219585450},{"oz":4,"t":1462226733211},{"oz":4,"t":1462233414293},{"oz":4,"t":1462237984663},{"oz":2,"t":1462240033382},{"oz":6,"t":1462246772894},{"oz":6,"t":1462272494071},{"oz":2,"t":1462284972751},{"oz":4,"t":1462288911974},{"oz":5,"t":1462298687025},{"oz":6,"t":1462317219661},{"oz":4,"t":1462320744104},{"oz":6,"t":1462328884928},{"oz":6,"t":1462343908004},{"oz":6,"t":1462356244751},{"oz":6,"t":1462367211770},{"oz":4,"t":1462374951117},{"oz":6,"t":1462386342509},{"oz":4,"t":1462396145622},{"oz":4,"t":1462398488349},{"oz":4,"t":1462410590400},{"oz":2,"t":1462412349468},{"oz":4,"t":1462412956774},{"oz":2,"t":1462413204228},{"oz":6,"t":1462431779236},{"oz":1,"t":1462431781060},{"oz":6,"t":1462443591676},{"oz":6,"t":1462453617379},{"oz":4,"t":1462456337513},{"oz":2,"t":1462468972179},{"oz":4,"t":1462481177502},{"oz":3,"t":1462498727568},{"oz":3,"t":1462500335108},{"oz":6,"t":1462513758357},{"oz":2,"t":1462513760718},{"oz":6,"t":1462535453036},{"oz":6,"t":1462541415138},{"oz":4,"t":1462545756804},{"oz":2,"t":1462558603071},{"oz":3,"t":1462566305023},{"oz":5,"t":1462569633008},{"oz":5,"t":1462577624732},{"oz":6,"t":1462590332440},{"oz":2,"t":1462590959739},{"oz":6,"t":1462616853550},{"oz":6,"t":1462625885668},{"oz":2,"t":1462628963914},{"oz":1,"t":1462633169876},{"oz":1,"t":1462633513224},{"oz":6,"t":1462644800358},{"oz":3,"t":1462651041029},{"oz":6,"t":1462663430460},{"oz":6,"t":1462670584860},{"oz":6,"t":1462680378083},{"oz":2,"t":1462680380700},{"oz":5,"t":1462695009494},{"oz":6,"t":1462708329596},{"oz":4,"t":1462715356726},{"oz":4,"t":1462720342349},{"oz":4,"t":1462732143460},{"oz":2,"t":1462748143411},{"oz":2,"t":1462756176871},{"oz":6,"t":1462758280832},{"oz":6,"t":1462772381972},{"oz":6,"t":1462789906953},{"oz":6,"t":1462799611778},{"oz":3,"t":1462809395999},{"oz":3,"t":1462817242964},{"oz":6,"t":1462829477480},{"oz":6,"t":1462845123382},{"oz":6,"t":1462860106272},{"oz":2,"t":1462860109362},{"oz":6,"t":1462880197716},{"oz":1,"t":1462891251234},{"oz":5,"t":1462893187270},{"oz":2,"t":1462901561719},{"oz":5,"t":1462919215415},{"oz":6,"t":1462926923646},{"oz":2,"t":1462929130653},{"oz":6,"t":1462939922218},{"oz":5,"t":1462948157834},{"oz":6,"t":1462963276417},{"oz":6,"t":1462987960429},{"oz":4,"t":1462999529034},{"oz":4,"t":1463008479547},{"oz":2,"t":1463008548242},{"oz":1,"t":1463013737479},{"oz":4,"t":1463016296540},{"oz":4,"t":1463018850351},{"oz":2,"t":1463019649782},{"oz":6,"t":1463036124774},{"oz":4,"t":1463044786929},{"oz":4,"t":1463055270057},{"oz":4,"t":1463062190454},{"oz":4,"t":1463064086605},{"oz":4,"t":1463078023873},{"oz":4,"t":1463086682359},{"oz":6,"t":1463097540948},{"oz":6,"t":1463106806205},{"oz":6,"t":1463114667019},{"oz":2,"t":1463114670879},{"oz":4,"t":1463127782880},{"oz":4,"t":1463141343475},{"oz":4,"t":1463142589785},{"oz":3,"t":1463150776975},{"oz":3,"t":1463166946391},{"oz":4,"t":1463170863459},{"oz":3,"t":1463180270801},{"oz":6,"t":1463189264693},{"oz":6,"t":1463204691915},{"oz":2,"t":1463204695009},{"oz":6,"t":1463217898886},{"oz":6,"t":1463234296782},{"oz":4,"t":1463239651696},{"oz":4,"t":1463243554446},{"oz":4,"t":1463249366093},{"oz":4,"t":1463254822847},{"oz":2,"t":1463254930679},{"oz":3,"t":1463267183246},{"oz":4,"t":1463272770136},{"oz":3,"t":1463279401785},{"oz":6,"t":1463291242580},{"oz":6,"t":1463304377445},{"oz":4,"t":1463311967667},{"oz":3,"t":1463322445988},{"oz":6,"t":1463339148235},{"oz":4,"t":1463347130113},{"oz":4,"t":1463351424852},{"oz":2,"t":1463351651549},{"oz":6,"t":1463363765708},{"oz":6,"t":1463376105518},{"oz":6,"t":1463393729449},{"oz":6,"t":1463408069768},{"oz":4,"t":1463412034197},{"oz":6,"t":1463421811644},{"oz":4,"t":1463426757160},{"oz":6,"t":1463437990916},{"oz":2,"t":1463437992626},{"oz":4,"t":1463444070093},{"oz":6,"t":1463452164412},{"oz":6,"t":1463462951095},{"oz":2,"t":1463462955476},{"oz":6,"t":1463486270572},{"oz":6,"t":1463497812552},{"oz":3,"t":1463503146146},{"oz":4,"t":1463514918692},{"oz":6,"t":1463526865890},{"oz":6,"t":1463531575916},{"oz":6,"t":1463544337831},{"oz":6,"t":1463573065116},{"oz":4,"t":1463573431715},{"oz":6,"t":1463581914410},{"oz":6,"t":1463587272030},{"oz":6,"t":1463601498146},{"oz":4,"t":1463611976315},{"oz":1,"t":1463612678526},{"oz":6,"t":1463618015568},{"oz":4,"t":1463621619973},{"oz":2,"t":1463621907016},{"oz":6,"t":1463627073543},{"oz":6,"t":1463656169116},{"oz":6,"t":1463666246722},{"oz":4,"t":1463670809138},{"oz":6,"t":1463675385441},{"oz":1,"t":1463675388497},{"oz":4,"t":1463689388965},{"oz":4,"t":1463705256662},{"oz":6,"t":1463707331420},{"oz":6,"t":1463720207151},{"oz":1,"t":1463720209370},{"oz":6,"t":1463735972611},{"oz":6,"t":1463747164964},{"oz":4,"t":1463752124502},{"oz":4,"t":1463755518044},{"oz":2,"t":1463769663386},{"oz":4,"t":1463772309410},{"oz":4,"t":1463773149357},{"oz":2,"t":1463783314650},{"oz":6,"t":1463790658505},{"oz":2,"t":1463792971280},{"oz":4,"t":1463797548315},{"oz":5,"t":1463821613140},{"oz":6,"t":1463833293179},{"oz":6,"t":1463842049438},{"oz":6,"t":1463859488837},{"oz":4,"t":1463871873608},{"oz":4,"t":1463874923995},{"oz":6,"t":1463879616008},{"oz":6,"t":1463922194285},{"oz":4,"t":1463923645635},{"oz":4,"t":1463926563173},{"oz":4,"t":1463935630059},{"oz":6,"t":1463944363725},{"oz":2,"t":1463945235754},{"oz":4,"t":1463949632698},{"oz":6,"t":1463961386358},{"oz":6,"t":1463970160503},{"oz":6,"t":1463984575047},{"oz":2,"t":1463984583687},{"oz":6,"t":1464007687687},{"oz":4,"t":1464014295546},{"oz":6,"t":1464023344797},{"oz":6,"t":1464034695880},{"oz":2,"t":1464034698223},{"oz":6,"t":1464048955911},{"oz":6,"t":1464055774490},{"oz":4,"t":1464070772758},{"oz":6,"t":1464092957067},{"oz":6,"t":1464100651031},{"oz":5,"t":1464111036021},{"oz":6,"t":1464123911949},{"oz":2,"t":1464123914405},{"oz":6,"t":1464135476650},{"oz":6,"t":1464137949185},{"oz":6,"t":1464147902765},{"oz":6,"t":1464176679550},{"oz":6,"t":1464187326044},{"oz":4,"t":1464194372406},{"oz":6,"t":1464202148944},{"oz":2,"t":1464202150500},{"oz":4,"t":1464204147914},{"oz":6,"t":1464216790238},{"oz":6,"t":1464226934422},{"oz":2,"t":1464226937251},{"oz":6,"t":1464251737654},{"oz":6,"t":1464262429468},{"oz":6,"t":1464272583453},{"oz":6,"t":1464278202161},{"oz":6,"t":1464292468462},{"oz":6,"t":1464314143834},{"oz":6,"t":1464301681869},{"oz":2,"t":1464314883905},{"oz":6,"t":1464314887353},{"oz":6,"t":1464321779050},{"oz":6,"t":1464333904930},{"oz":6,"t":1464349359911},{"oz":2,"t":1464356633606},{"oz":2,"t":1464357619985},{"oz":4,"t":1464360056691},{"oz":5,"t":1464373105850},{"oz":5,"t":1464379740000},{"oz":4,"t":1464386990483},{"oz":3,"t":1464396865223},{"oz":6,"t":1464398276706},{"oz":1,"t":1464398278885},{"oz":5,"t":1464425435116},{"oz":6,"t":1464438169570},{"oz":6,"t":1464444479927},{"oz":4,"t":1464451270308},{"oz":4,"t":1464456160644},{"oz":6,"t":1464467299953},{"oz":1,"t":1464475119024},{"oz":4,"t":1464482826957},{"oz":4,"t":1464486669445},{"oz":4,"t":1464515030660},{"oz":6,"t":1464525775826},{"oz":4,"t":1464530608675},{"oz":6,"t":1464549560806},{"oz":2,"t":1464550577849},{"oz":2,"t":1464553037253},{"oz":6,"t":1464569172990},{"oz":4,"t":1464575676655},{"oz":4,"t":1464573707708},{"oz":6,"t":1464589884641},{"oz":6,"t":1464608746530},{"oz":4,"t":1464615264146},{"oz":2,"t":1464615807284},{"oz":6,"t":1464621767882},{"oz":6,"t":1464638920268},{"oz":4,"t":1464643119529},{"oz":6,"t":1464654060747},{"oz":6,"t":1464657942899},{"oz":4,"t":1464672272331},{"oz":6,"t":1464692457124},{"oz":6,"t":1464702801771},{"oz":4,"t":1464726640875},{"oz":6,"t":1464736840424},{"oz":6,"t":1464742749912},{"oz":2,"t":1464742753360},{"oz":6,"t":1464772926707},{"oz":6,"t":1464783579990},{"oz":4,"t":1464786066174},{"oz":4,"t":1464793929100},{"oz":5,"t":1464798419826},{"oz":4,"t":1464811731826},{"oz":6,"t":1464823186740},{"oz":4,"t":1464827012956},{"oz":6,"t":1464830194907},{"oz":6,"t":1464847352804},{"oz":2,"t":1464847355054},{"oz":6,"t":1464863361836},{"oz":6,"t":1464872202564},{"oz":4,"t":1464888580749},{"oz":6,"t":1464897841227},{"oz":6,"t":1464919867667},{"oz":4,"t":1464921013785},{"oz":6,"t":1464906710963},{"oz":4,"t":1464931822931},{"oz":6,"t":1464942619130},{"oz":6,"t":1464959240244},{"oz":4,"t":1464962344565},{"oz":3,"t":1464964753068},{"oz":6,"t":1464979489110},{"oz":4,"t":1464982990725},{"oz":3,"t":1464996752378},{"oz":3,"t":1464999906926},{"oz":4,"t":1465003329528},{"oz":6,"t":1465016569667},{"oz":4,"t":1465037611264},{"oz":6,"t":1465048343470},{"oz":6,"t":1465064940009},{"oz":5,"t":1465083346092},{"oz":2,"t":1465090085696},{"oz":6,"t":1465097755738},{"oz":6,"t":1465128580116},{"oz":6,"t":1465134118527},{"oz":4,"t":1465146558752},{"oz":6,"t":1465156110179},{"oz":2,"t":1465160791718},{"oz":5,"t":1465171680095},{"oz":6,"t":1465181199089},{"oz":6,"t":1465183360874},{"oz":4,"t":1465190300646},{"oz":4,"t":1465218499054},{"oz":4,"t":1465224270200},{"oz":6,"t":1465232156278},{"oz":6,"t":1465240421904},{"oz":6,"t":1465254736742},{"oz":6,"t":1465261775922},{"oz":6,"t":1465273683232},{"oz":4,"t":1465303819060},{"oz":1,"t":1465310808906},{"oz":3,"t":1465317796100},{"oz":3,"t":1465326056044},{"oz":1,"t":1465333402341},{"oz":2,"t":1465334995201},{"oz":4,"t":1465337478677},{"oz":4,"t":1465343398124},{"oz":6,"t":1465352628821},{"oz":5,"t":1465352873408},{"oz":6,"t":1465370282681},{"oz":4,"t":1465377391385},{"oz":1,"t":1465390128150},{"oz":2,"t":1465391264785},{"oz":6,"t":1465397691334},{"oz":3,"t":1465404629685},{"oz":6,"t":1465419930848},{"oz":3,"t":1465432072656},{"oz":5,"t":1465436106961},{"oz":6,"t":1465438370935},{"oz":6,"t":1465440921283},{"oz":4,"t":1465474464023},{"oz":4,"t":1465482286324},{"oz":6,"t":1465492511956},{"oz":6,"t":1465506489941},{"oz":6,"t":1465514196139},{"oz":3,"t":1465522995136},{"oz":6,"t":1465528030387},{"oz":6,"t":1465534958417},{"oz":6,"t":1465559838766},{"oz":6,"t":1465569669521},{"oz":6,"t":1465589340227},{"oz":6,"t":1465575020394},{"oz":4,"t":1465591528034},{"oz":4,"t":1465608939835},{"oz":4,"t":1465613725021},{"oz":2,"t":1465654574073},{"oz":6,"t":1465668732963},{"oz":4,"t":1465680314651},{"oz":4,"t":1465675243298},{"oz":6,"t":1465705494408},{"oz":4,"t":1465712981216},{"oz":5,"t":1465734974589},{"oz":6,"t":1465745357298},{"oz":6,"t":1465749454497},{"oz":2,"t":1465758844027},{"oz":2,"t":1465776323335},{"oz":6,"t":1465779651172},{"oz":6,"t":1465783824683},{"oz":2,"t":1465784068499},{"oz":6,"t":1465808626891},{"oz":6,"t":1465826917325},{"oz":4,"t":1465858949445},{"oz":6,"t":1465844679242},{"oz":5,"t":1465864911317},{"oz":6,"t":1465868691694},{"oz":4,"t":1465870142848},{"oz":1,"t":1465871272754},{"oz":6,"t":1465875343873},{"oz":4,"t":1465883083168},{"oz":6,"t":1465902747557},{"oz":4,"t":1465914275693},{"oz":6,"t":1465927160892},{"oz":6,"t":1465938158126},{"oz":6,"t":1465950640312},{"oz":4,"t":1465954298306},{"oz":6,"t":1465967445480},{"oz":6,"t":1465989621975},{"oz":4,"t":1466000745008},{"oz":6,"t":1466018892379},{"oz":4,"t":1466032929923},{"oz":4,"t":1466036424772},{"oz":6,"t":1466050813763},{"oz":6,"t":1466056336351},{"oz":6,"t":1466081796526},{"oz":1,"t":1466083075648},{"oz":3,"t":1466085255784},{"oz":6,"t":1466090479476},{"oz":6,"t":1466090615668},{"oz":6,"t":1466103831823},{"oz":6,"t":1466110430970},{"oz":4,"t":1466118329749},{"oz":2,"t":1466119716851},{"oz":2,"t":1466120183607},{"oz":6,"t":1466128602972},{"oz":1,"t":1466128607607},{"oz":6,"t":1466139284406},{"oz":4,"t":1466172453649},{"oz":3,"t":1466175806960},{"oz":5,"t":1466190320752},{"oz":5,"t":1466204222754},{"oz":4,"t":1466206319540},{"oz":6,"t":1466212743335},{"oz":2,"t":1466214795585},{"oz":3,"t":1466216676447},{"oz":6,"t":1466249693321},{"oz":2,"t":1466249698521},{"oz":6,"t":1466261991491},{"oz":4,"t":1466268289960},{"oz":4,"t":1466289009235},{"oz":4,"t":1466292074238},{"oz":6,"t":1466324225597},{"oz":6,"t":1466338877966},{"oz":3,"t":1466358417024},{"oz":3,"t":1466351290089},{"oz":3,"t":1466361119461},{"oz":2,"t":1466367919894},{"oz":6,"t":1466372963940},{"oz":4,"t":1466389594315},{"oz":2,"t":1466390755638},{"oz":6,"t":1466420285240},{"oz":4,"t":1466432942676},{"oz":4,"t":1466435477730},{"oz":6,"t":1466449287956},{"oz":6,"t":1466460658496},{"oz":2,"t":1466475593484},{"oz":6,"t":1466479026727},{"oz":6,"t":1466489876620},{"oz":1,"t":1466489880238},{"oz":5,"t":1466494324273},{"oz":3,"t":1466514420214},{"oz":4,"t":1466519242043},{"oz":4,"t":1466531410455},{"oz":5,"t":1466544308199},{"oz":3,"t":1466548639913},{"oz":6,"t":1466562376831},{"oz":6,"t":1466570251206},{"oz":6,"t":1466591961113},{"oz":6,"t":1466608359467},{"oz":5,"t":1466624965236},{"oz":5,"t":1466645293147},{"oz":5,"t":1466631803039},{"oz":6,"t":1466651353535},{"oz":6,"t":1466671012061},{"oz":2,"t":1466671014502},{"oz":6,"t":1466683262475},{"oz":6,"t":1466699420623},{"oz":6,"t":1466707192344},{"oz":6,"t":1466710930284},{"oz":6,"t":1466727863945},{"oz":6,"t":1466730097556},{"oz":6,"t":1466746453222},{"oz":1,"t":1466746455608},{"oz":6,"t":1466759118110},{"oz":6,"t":1466769950074},{"oz":2,"t":1466793530375},{"oz":6,"t":1466780954024},{"oz":5,"t":1466813634570},{"oz":6,"t":1466819088986},{"oz":4,"t":1466819733270},{"oz":6,"t":1466831904639},{"oz":6,"t":1466839025573},{"oz":6,"t":1466857861964},{"oz":6,"t":1466863943080},{"oz":6,"t":1466874906112},{"oz":6,"t":1466878725346},{"oz":6,"t":1466892625554},{"oz":4,"t":1466896843417},{"oz":6,"t":1466902377097},{"oz":6,"t":1466916867820},{"oz":6,"t":1466939261518},{"oz":3,"t":1466951560636},{"oz":3,"t":1466952036486},{"oz":2,"t":1466961575761},{"oz":6,"t":1466969421705},{"oz":2,"t":1466969624343},{"oz":6,"t":1466980344334},{"oz":6,"t":1466988925112},{"oz":2,"t":1466988931678},{"oz":6,"t":1467027382159},{"oz":4,"t":1467042396468},{"oz":3,"t":1467047322342},{"oz":6,"t":1467066730246},{"oz":1,"t":1467066732628},{"oz":6,"t":1467074465934},{"oz":6,"t":1467097353617},{"oz":6,"t":1467114799243},{"oz":6,"t":1467148357622},{"oz":6,"t":1467154246787},{"oz":6,"t":1467167585861},{"oz":2,"t":1467167588671},{"oz":6,"t":1467201405308},{"oz":2,"t":1467201407810},{"oz":2,"t":1467214456482},{"oz":6,"t":1467220365238},{"oz":3,"t":1467225082500},{"oz":3,"t":1467223314742},{"oz":4,"t":1467240815850},{"oz":6,"t":1467257483028},{"oz":1,"t":1467257487553},{"oz":6,"t":1467282367327},{"oz":4,"t":1467294267221},{"oz":2,"t":1467294348807},{"oz":6,"t":1467313276828},{"oz":6,"t":1467323320622},{"oz":6,"t":1467334098538},{"oz":2,"t":1467334100872},{"oz":6,"t":1467363693868},{"oz":2,"t":1467363696119},{"oz":6,"t":1467384368559},{"oz":2,"t":1467394560886},{"oz":6,"t":1467395709441},{"oz":5,"t":1467414451124},{"oz":6,"t":1467422643693},{"oz":6,"t":1467450568997},{"oz":6,"t":1467467877061},{"oz":4,"t":1467481181911},{"oz":4,"t":1467482014195},{"oz":3,"t":1467494807753},{"oz":4,"t":1467495248901},{"oz":4,"t":1467498654936},{"oz":6,"t":1467515995584},{"oz":6,"t":1467540639229},{"oz":6,"t":1467560003884},{"oz":4,"t":1467584078345},{"oz":4,"t":1467584084585},{"oz":4,"t":1467585976983},{"oz":6,"t":1467593970995},{"oz":6,"t":1467625125307},{"oz":6,"t":1467631369442},{"oz":6,"t":1467642962505},{"oz":4,"t":1467652017495},{"oz":4,"t":1467653001375},{"oz":6,"t":1467668730220},{"oz":6,"t":1467685557948},{"oz":2,"t":1467685560163},{"oz":6,"t":1467717028081},{"oz":2,"t":1467731692433},{"oz":2,"t":1467743939994},{"oz":6,"t":1467743943583},{"oz":4,"t":1467766300877},{"oz":6,"t":1467748938135},{"oz":6,"t":1467769769035},{"oz":6,"t":1467803322689},{"oz":4,"t":1467814241419},{"oz":4,"t":1467826724047},{"oz":6,"t":1467838369267},{"oz":6,"t":1467852398932},{"oz":6,"t":1467865907122},{"oz":2,"t":1467865909787},{"oz":6,"t":1467885176170},{"oz":5,"t":1467905110995},{"oz":4,"t":1467919538098},{"oz":6,"t":1467926003271},{"oz":6,"t":1467943399925},{"oz":2,"t":1467943403835},{"oz":3,"t":1467944418205},{"oz":6,"t":1467977967751},{"oz":6,"t":1467993127811},{"oz":2,"t":1467993682632},{"oz":6,"t":1468006389730},{"oz":2,"t":1468021286749},{"oz":6,"t":1468026635849},{"oz":2,"t":1468026639133},{"oz":6,"t":1468060699804},{"oz":4,"t":1468068057365},{"oz":4,"t":1468099009236},{"oz":5,"t":1468087690596},{"oz":6,"t":1468111619090},{"oz":2,"t":1468111621945},{"oz":6,"t":1468115436762},{"oz":2,"t":1468115620450},{"oz":6,"t":1468144321466},{"oz":6,"t":1468160948501},{"oz":6,"t":1468181853909},{"oz":2,"t":1468181855356},{"oz":6,"t":1468201520615},{"oz":2,"t":1468201522993},{"oz":6,"t":1468235692452},{"oz":6,"t":1468247267859},{"oz":5,"t":1468273185524},{"oz":6,"t":1468275000181},{"oz":6,"t":1468289261571},{"oz":2,"t":1468289264153},{"oz":6,"t":1468318084248},{"oz":6,"t":1468333757173},{"oz":3,"t":1468348955957},{"oz":6,"t":1468353831585},{"oz":3,"t":1468354579051},{"oz":6,"t":1468374726637},{"oz":2,"t":1468374730609},{"oz":6,"t":1468395404102},{"oz":2,"t":1468395406545},{"oz":6,"t":1468412541598},{"oz":6,"t":1468416726917},{"oz":3,"t":1468440588609},{"oz":6,"t":1468459529723},{"oz":1,"t":1468459531990},{"oz":3,"t":1468462289261},{"oz":6,"t":1468490619014},{"oz":6,"t":1468503893115},{"oz":2,"t":1468518733346},{"oz":6,"t":1468543881975},{"oz":2,"t":1468543885384},{"oz":6,"t":1468559533980},{"oz":2,"t":1468559536567},{"oz":6,"t":1468576687541},{"oz":6,"t":1468593557240},{"oz":2,"t":1468605951721},{"oz":6,"t":1468633134534},{"oz":2,"t":1468633136543},{"oz":6,"t":1468635375806},{"oz":6,"t":1468662799155},{"oz":2,"t":1468662802350},{"oz":6,"t":1468676833289},{"oz":5,"t":1468693669900},{"oz":6,"t":1468715061822},{"oz":1,"t":1468718310007},{"oz":4,"t":1468734530625},{"oz":6,"t":1468770513878},{"oz":3,"t":1468775325677},{"oz":2,"t":1468793904041},{"oz":2,"t":1468795720938},{"oz":6,"t":1468809469331},{"oz":6,"t":1468822243086},{"oz":2,"t":1468822246129},{"oz":4,"t":1468836003966},{"oz":3,"t":1468852476090},{"oz":3,"t":1468872063172},{"oz":3,"t":1468876093597},{"oz":6,"t":1468897271493},{"oz":2,"t":1468897274070},{"oz":2,"t":1468911375443},{"oz":6,"t":1468921849519},{"oz":6,"t":1468948400522},{"oz":4,"t":1468948403275},{"oz":5,"t":1468966169265},{"oz":5,"t":1468966172062},{"oz":4,"t":1468978916579},{"oz":4,"t":1468980768958},{"oz":4,"t":1468982562219},{"oz":6,"t":1468998691875},{"oz":6,"t":1469013652647},{"oz":1,"t":1469013658294},{"oz":4,"t":1469033669585},{"oz":2,"t":1469040067906},{"oz":3,"t":1469055059658},{"oz":6,"t":1469063406496},{"oz":4,"t":1469065257971},{"oz":6,"t":1469098293416},{"oz":4,"t":1469106497113},{"oz":6,"t":1469115231846},{"oz":2,"t":1469115233741},{"oz":6,"t":1469135248493},{"oz":6,"t":1469171077058},{"oz":6,"t":1469149555298},{"oz":6,"t":1469183298513},{"oz":6,"t":1469195552929},{"oz":2,"t":1469195555245},{"oz":6,"t":1469209555164},{"oz":2,"t":1469209558054},{"oz":6,"t":1469225039646},{"oz":2,"t":1469225042475},{"oz":6,"t":1469239670253},{"oz":2,"t":1469240502435},{"oz":4,"t":1469256552945},{"oz":6,"t":1469273091953},{"oz":2,"t":1469273094425},{"oz":6,"t":1469282969647},{"oz":3,"t":1469299842658},{"oz":6,"t":1469325221390},{"oz":2,"t":1469325025896},{"oz":6,"t":1469339432189},{"oz":2,"t":1469339437755},{"oz":6,"t":1469364741420},{"oz":6,"t":1469371115462},{"oz":6,"t":1469392104979},{"oz":6,"t":1469407656745},{"oz":2,"t":1469408824770},{"oz":4,"t":1469413910041},{"oz":3,"t":1469424563372},{"oz":6,"t":1469446132191},{"oz":2,"t":1469446137170},{"oz":6,"t":1469465891078},{"oz":2,"t":1469465893460},{"oz":5,"t":1469481380060},{"oz":1,"t":1469481785763},{"oz":2,"t":1469498118878},{"oz":6,"t":1469500809033},{"oz":2,"t":1469500814090},{"oz":6,"t":1469525465429},{"oz":2,"t":1469545566833},{"oz":5,"t":1469552660904},{"oz":6,"t":1469583905674},{"oz":2,"t":1469583908426},{"oz":5,"t":1469560256827},{"oz":2,"t":1469573473218},{"oz":2,"t":1469569889674},{"oz":6,"t":1469600817844},{"oz":2,"t":1469600819995},{"oz":6,"t":1469608966915},{"oz":4,"t":1469618009810},{"oz":6,"t":1469629596962},{"oz":6,"t":1469649695244},{"oz":1,"t":1469649698784},{"oz":3,"t":1469665591512},{"oz":6,"t":1469669136930},{"oz":2,"t":1469669139803},{"oz":6,"t":1469690013458},{"oz":2,"t":1469690015705},{"oz":6,"t":1469706109740},{"oz":2,"t":1469706112759},{"oz":6,"t":1469719866109},{"oz":2,"t":1469733683819},{"oz":3,"t":1469743289151},{"oz":5,"t":1469749774827},{"oz":6,"t":1469763146718},{"oz":2,"t":1469763149107},{"oz":6,"t":1469784452571},{"oz":6,"t":1469793055066},{"oz":6,"t":1469800415775},{"oz":6,"t":1469817395614},{"oz":1,"t":1469817397794},{"oz":3,"t":1469840071927},{"oz":3,"t":1469835324881},{"oz":2,"t":1469832954602},{"oz":6,"t":1469863666695},{"oz":4,"t":1469865566696},{"oz":6,"t":1469878307105},{"oz":5,"t":1469918704229},{"oz":2,"t":1469917511342},{"oz":3,"t":1469897786844},{"oz":6,"t":1469931752092},{"oz":2,"t":1469931754867},{"oz":4,"t":1469933756235},{"oz":4,"t":1469959985791},{"oz":3,"t":1469949130578},{"oz":4,"t":1469967649779},{"oz":6,"t":1469980190911},{"oz":6,"t":1470006293528},{"oz":6,"t":1470016524197},{"oz":4,"t":1470016527614},{"oz":6,"t":1470030724088},{"oz":6,"t":1470044515710},{"oz":6,"t":1470061588519},{"oz":3,"t":1470082189927},{"oz":6,"t":1470103297646},{"oz":2,"t":1470103300336},{"oz":6,"t":1470127591858},{"oz":1,"t":1470127594970},{"oz":6,"t":1470142843419},{"oz":6,"t":1470187458315},{"oz":6,"t":1470196164658},{"oz":4,"t":1470215077699},{"oz":4,"t":1470225812254},{"oz":6,"t":1470243447389},{"oz":4,"t":1470251873917},{"oz":4,"t":1470262880047},{"oz":2,"t":1470263048714},{"oz":2,"t":1470263160606},{"oz":6,"t":1470281866954},{"oz":2,"t":1470282260394},{"oz":6,"t":1470294218881},{"oz":6,"t":1470313896745},{"oz":6,"t":1470329700317},{"oz":3,"t":1470329703163},{"oz":6,"t":1470337762549},{"oz":3,"t":1470355568815},{"oz":6,"t":1470361368551},{"oz":5,"t":1470367080198},{"oz":5,"t":1470384202479},{"oz":6,"t":1470399060998},{"oz":4,"t":1470416840996},{"oz":6,"t":1470445242696},{"oz":6,"t":1470430925582},{"oz":5,"t":1470452741995},{"oz":5,"t":1470473364573},{"oz":5,"t":1470517458162},{"oz":6,"t":1470531106131},{"oz":6,"t":1470534652753},{"oz":2,"t":1470534656035},{"oz":6,"t":1470546533469},{"oz":2,"t":1470546536442},{"oz":6,"t":1470561914630},{"oz":6,"t":1470577481789},{"oz":6,"t":1470592598464},{"oz":6,"t":1470608313964},{"oz":6,"t":1470622972125},{"oz":2,"t":1470622974299},{"oz":4,"t":1470625240252},{"oz":6,"t":1470640525732},{"oz":2,"t":1470640528914},{"oz":6,"t":1470655767657},{"oz":5,"t":1470675914297},{"oz":6,"t":1470690565619},{"oz":6,"t":1470711537656},{"oz":2,"t":1470711539287},{"oz":4,"t":1470712844477},{"oz":6,"t":1470733107531},{"oz":6,"t":1470763266409},{"oz":6,"t":1470777116279},{"oz":6,"t":1470796151338},{"oz":2,"t":1470796153377},{"oz":6,"t":1470800408105},{"oz":6,"t":1470823473633},{"oz":6,"t":1470837482839},{"oz":6,"t":1470854014410},{"oz":6,"t":1470870983800},{"oz":6,"t":1470883056061},{"oz":2,"t":1470883059412},{"oz":6,"t":1470906079140},{"oz":6,"t":1470916168502},{"oz":6,"t":1470942784870},{"oz":1,"t":1470942787093},{"oz":2,"t":1470939259148},{"oz":3,"t":1470932083228},{"oz":6,"t":1470967001510},{"oz":2,"t":1470967003530},{"oz":4,"t":1470967915537},{"oz":6,"t":1470986794161},{"oz":6,"t":1471003514373},{"oz":6,"t":1471013784598},{"oz":5,"t":1471035759102},{"oz":4,"t":1471032226639},{"oz":5,"t":1471043840787},{"oz":6,"t":1471051747740},{"oz":5,"t":1471061090726},{"oz":6,"t":1471078374955},{"oz":6,"t":1471087031799},{"oz":6,"t":1471095823407},{"oz":6,"t":1471108470299},{"oz":6,"t":1471113377369},{"oz":4,"t":1471127059957},{"oz":5,"t":1471156601514},{"oz":5,"t":1471145899572},{"oz":4,"t":1471167732988},{"oz":3,"t":1471178475022},{"oz":6,"t":1471190358155},{"oz":6,"t":1471209638374},{"oz":6,"t":1471226852894},{"oz":4,"t":1471244475200},{"oz":2,"t":1471255821478},{"oz":4,"t":1471270918782},{"oz":6,"t":1471281985675},{"oz":3,"t":1471298335615},{"oz":3,"t":1471308285316},{"oz":3,"t":1471337768496},{"oz":4,"t":1471348968320},{"oz":6,"t":1471375968118},{"oz":3,"t":1471385695199},{"oz":6,"t":1471391158255},{"oz":6,"t":1471398450524},{"oz":2,"t":1471398453695},{"oz":4,"t":1471426861748},{"oz":6,"t":1471435373291},{"oz":2,"t":1471460149820},{"oz":4,"t":1471480262389},{"oz":6,"t":1471492057649},{"oz":6,"t":1471506894993},{"oz":2,"t":1471516333041},{"oz":3,"t":1471530419354},{"oz":6,"t":1471553703655},{"oz":6,"t":1471574249674},{"oz":4,"t":1471574779332},{"oz":6,"t":1471600121007},{"oz":6,"t":1471613647130},{"oz":2,"t":1471633954453},{"oz":4,"t":1471657391235},{"oz":4,"t":1471662838533},{"oz":3,"t":1471663529605},{"oz":6,"t":1471676811309},{"oz":5,"t":1471691656938},{"oz":5,"t":1471707551809},{"oz":3,"t":1471715207043},{"oz":6,"t":1471728978294},{"oz":4,"t":1471743486452},{"oz":3,"t":1471748558607},{"oz":4,"t":1471767268939},{"oz":2,"t":1471776374796},{"oz":6,"t":1471783029460},{"oz":4,"t":1471796353507},{"oz":4,"t":1471812389929},{"oz":4,"t":1471823179842},{"oz":6,"t":1471837206219},{"oz":6,"t":1471851464401},{"oz":6,"t":1471862333309},{"oz":4,"t":1471872522730},{"oz":4,"t":1471884294502},{"oz":6,"t":1471906616026},{"oz":6,"t":1471921364802},{"oz":4,"t":1471923101498},{"oz":4,"t":1471924772175},{"oz":5,"t":1471944164942},{"oz":6,"t":1471952509375},{"oz":6,"t":1471959250994},{"oz":6,"t":1471978885809},{"oz":2,"t":1472001323158},{"oz":6,"t":1472008181936},{"oz":6,"t":1472024397819},{"oz":6,"t":1472032403377},{"oz":5,"t":1472043117520},{"oz":3,"t":1472064218583},{"oz":6,"t":1472083539640},{"oz":4,"t":1472099246092},{"oz":6,"t":1472111165949},{"oz":4,"t":1472130097526},{"oz":4,"t":1472119365970},{"oz":4,"t":1472149976353},{"oz":4,"t":1472170042564},{"oz":4,"t":1472183285215}]
},{}],3:[function(require,module,exports){
console.log('hello world')
var moment = require('moment')

var bottle_data = require('../output/bottles.json')
histogram()

function all_plot () {
  var w = 1000
  var h = 500
  var svg = d3.select('div#main').append('svg')
    .attr('viewBox', [0, 0, w, h].join(' '))
    .attr('preserveApsectRatio', 'xMidYMid')
    .attr('width', '100%')
    .style('background-color', 'rgb(240,240,240)')

  console.log(bottle_data)

  var min_time = d3.min(bottle_data, function (d) { return d.t })
  var max_time = d3.max(bottle_data, function (d) { return d.t })

  var scale_x_time = d3.scaleLinear()
    .domain([min_time, max_time])
    .range([0, w])

  console.log('time values', min_time, max_time)
  console.log('time values', new Date(min_time), new Date(max_time))

  // graph, (x, time)(y, hour of day)

  var scale_y_hour_of_day = d3.scaleLinear().domain([0, 23]).range([h * 0.1, (h - (h * 0.1))])

  bottle_data.forEach(function (b) {
    svg.append('circle')
      .attr('cx', scale_x_time(b.t))
      .attr('cy', scale_y_hour_of_day(moment(b.t).hours()))
      .attr('r', b.oz)
      .attr('fill', 'rgb(33,66,255)')
      .attr('fill-opacity', 0.5)
  })
}

// histogram hour of the day
function histogram () {
  var w = 1000
  var h = 300
  var svg = d3.select('div#main').append('svg')
    .attr('viewBox', [0, 0, w, h].join(' '))
    .attr('preserveApsectRatio', 'xMidYMid')
    .attr('width', '100%')
    .style('background-color', 'rgb(240,240,240)')

  var d = {}
  bottle_data.forEach(function (b) {
    var hour = moment(b.t).hours()
    if (d[hour] === undefined) {
      d[hour] = 0
    }
    d[hour] += 1
  })
  console.log(d)
  var max = 0
  d3.range(0, 24).forEach(function (v) {
    var value = d[v]
    if (value > max) {
      max = value
    }
  })

  var scale_x = d3.scaleLinear().domain([0, 24]).range([0, w])
  var scale_y = d3.scaleLinear().domain([0, max]).range([0, h])

  d3.range(0, 24).forEach(function (v, idx) {
    var value = d[v]
    var g = svg.append('g').attr('transform', ['translate(', scale_x(idx), 0 , ')'].join(' '))
    g.append('rect')
      .attr('x', 0)
      .attr('y', h - scale_y(value))
      .attr('width', scale_x(1) - 1)
      .attr('height', scale_y(value))
      .attr('fill', 'rgb(33,66,255)')
      .attr('stroke', 'none')
    g.append('text').text(function () {
      var am_pm = 'AM'
      if (idx >= 12) {
        am_pm = 'PM'
      }
      var v = (idx % 12)
      if (v === 0) {
        v = 12
      }
      return (v + am_pm)
    }).attr('x', scale_x(1) * 0.5)
      .attr('y', h - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .attr('fill', 'white')

  })

}

},{"../output/bottles.json":2,"moment":1}]},{},[3]);
