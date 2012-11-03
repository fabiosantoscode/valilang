/* valilang
 *
 * Licensed under the WTFPL Version 2
 * 
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://sam.zoy.org/wtfpl/COPYING for more details. */
(function (window, document) {
    "use strict";
    var rValilangMimeType = /valilang/,
        rWhitespace = /^\s+$/,
        rRuleWithArguments = /^([a-zA-Z_0-9]+)-(.*?)$/,
        rRuleWithoutArguments = /^([a-zA-Z_0-9]+)$/,
        valilang;
    // Valilang object, assigned to the global namespace for API access.
    valilang = window.valilang = {
        // default validation options. Overridden in valilang scripts.
        options: {
            binding: 'keyup'
        },
        // Initial package of rules.
        rules: {
            required: function () {
                function required_validator(value) {
                    return value || null;
                }
                return required_validator;
            },
            email: function () {
                var email_re = /^\S+@\S+\.\S+$/;
                function email_validator(email) {
                    return email_re.test(email) ? email : null;
                }
                return email_validator;
            },
            min: function (minimum) {
                return function (val) {
                    var cmp = typeof (val) === 'string' ? val.length : val;
                    return cmp >= minimum ? val : null;
                };
            },
            max: function (maximum) {
                return function (val) {
                    var cmp = typeof (val) === 'string' ? val.length : val;
                    return cmp <= maximum ? val : null;
                };
            },
            listmin: function (minimum) {
                function min_validator(list) {
                    return list.length >= minimum ? list : null;
                }
                min_validator.takesList = true;
                return min_validator;
            },
            listmax: function (maximum) {
                function max_validator(list) {
                    return list.length <= maximum ? list : null;
                }
                max_validator.takesList = true;
                return max_validator;
            },
            split: function (byCharacters) {
                var i, splitter;
                byCharacters = byCharacters || ' \n';
                function makeSplitRegexp(splitBy) {
                    var out = '[';
                    // The slash (\) can be used to escape special characters.
                    for (i = 0; i < splitBy.length; i++) {
                        if (!/[a-zA-Z0]/.exec(splitBy[i])) {
                            out += '^\\' + splitBy[i];
                        }
                    }
                    return new RegExp(out + ']+');
                }
                function splitByRegexp(str, regexp) {
                    var results = [],
                        current = '',
                        cutstr = str;
                    while (cutstr) {
                        current = regexp.exec(cutstr);
                        if (current) {
                            cutstr = cutstr.slice(cutstr.indexOf(current[0]) + current[0].length);
                            results.push(current);
                        } else {
                            break;
                        }
                    }
                    return results;
                }
                splitter = makeSplitRegexp(byCharacters);
                return function (value, remainingRules) {
                    var split = splitByRegexp(value, splitter),
                        current,
                        i;
                    while (remainingRules.length) {
                        current = remainingRules.shift();
                        // This function may take a split list as the argument.
                        if (current.takesList) {
                            if (current(split) === null) {
                                return null;
                            }
                        } else {
                            for (i = 0; i < split.length; i++) {
                                if (current(split[i]) === null) {
                                    return null;
                                }
                            }
                        }
                    }
                };
            }
        },
        start: function () {
            var scripts = document.getElementsByTagName("script"),
                script,
                i;
            for (i = 0; i < scripts.length; i++) {
                script = scripts[i];
                if (rValilangMimeType.test(script.type)) {
                    if (script.src) {
                        this.addRemote(script.src);
                    } else if (script.innerHTML && !rWhitespace.test(script.innerHTML)) {
                        this.parse(script.innerHTML);
                    }
                }
            }
        },
        parseError: function (location, error_desc) {
            var real_location;
            real_location = location === undefined ? "[this page]" : location;
            console.error('Error in ' + real_location + ': ' + error_desc);
        },
        addRemote: function (src) {
            console.error(src, 'Remote loading not yet implemented.');
        },
        parseOptions: function (json_data) {
            var option;
            for (option in this.options) {
                if (this.options.hasOwnProperty(option)) {
                    if (json_data[option] !== undefined) {
                        this.options[option] = json_data[option];
                    }
                }
            }
        },
        parse: function (json, script_location) {
            var fields = [],
                field_rules = [],
                func,
                filedata,
                rule_strings,
                i,
                j;
            try {
                filedata = JSON.parse(json);
            } catch (e) {
                this.parseError(script_location, e);
            }
            fields = filedata.fields;
            if (!fields) {
                this.parseError(script_location, '"fields" list expected.');
                return;
            }
            for (i = 0; i < fields.length; i++) {
                if (filedata.fieldValidation[fields[i]] !== undefined) {
                    rule_strings = filedata.fieldValidation[fields[i]];
                    for (j = 0; j < rule_strings.length; j++) {
                        func = this.ruleStringToRule(rule_strings[j]);
                        if (func !== undefined) {
                            field_rules.push(func);
                        } else {
                            console.warn('valilang: Rule "' + rule_strings[j] + '" not found');
                        }
                    }
                    this.bind(fields[i], field_rules);
                    field_rules = [];
                }
            }
        },
        ruleStringToRule: function (rule_string) {
            var regexResult, rule, args, ruleFunc;
            regexResult = rRuleWithArguments.exec(rule_string);
            if (regexResult) {
                rule = regexResult[1];
                args = regexResult[2];
            } else {
                regexResult = rRuleWithoutArguments.exec(rule_string);
                if (regexResult) {
                    rule = regexResult[1];
                    args = undefined;
                } else {
                    this.parseError(undefined, 'Invalid rule: ' + rule_string);
                }
            }
            ruleFunc = this.rules[rule];
            return ruleFunc === undefined ? undefined : ruleFunc(args);
        },
        addRule: function (rule_name, rule_func) {
            this.rules[rule_name] = rule_func;
        },
        invalidityCallback: function (element) {
            if (/\bvl-invalid\b/g.test(element.className)) {
                return;
            }
            element.className = element.className.replace(/\bvl-valid\b/g, '');
            element.className += ' vl-invalid';
        },
        validityCallback: function (element) {
            if (/\bvl-valid\b/g.test(element.className)) {
                return;
            }
            element.className = element.className.replace(/\bvl-invalid\b/g, '');
            element.className += ' vl-valid';
        },
        setInvalidityCallback: function (callback) {
            this.invalidityCallback = callback;
        },
        setValidityCallback: function (callback) {
            this.validityCallback = callback;
        },
        setDoneParsingCallback: function (callback) {
            this.doneParsingCallback = callback;
        },
        isInvalid: function (elm) {
            this.invalidityCallback(elm, elm.tagName === 'FORM');
        },
        isValid: function (elm) {
            this.validityCallback(elm, elm.tagName === 'FORM');
        },
        bind: function (elmName, rules) {
            var elm = document.getElementsByName(elmName)[0],
                that = this,
                handlerFunc = function () {
                    var remainingRules = [].concat(rules),
                        current;
                    while (remainingRules.length) {
                        current = remainingRules.shift();
                        if (current(elm.value, remainingRules) === null) {
                            that.isInvalid(elm);
                            return;
                        }
                    }
                    that.isValid(elm);
                };
            if (elm === undefined) {
                console.warn('field named "' + elmName + '" not defined');
            } else {
                if (elm.addEventListener) {
                    elm.addEventListener(this.options.binding, handlerFunc, false);
                } else if (elm.attachEvent) {
                    elm.attachEvent('on' + this.options.binding, handlerFunc);
                }
            }
        },
        doneParsing: function () {
            if (this.doneParsingCallback) {
                this.doneParsingCallback();
            }
        }
    };
    function readyHandler() {
        if (document.readyState === 'complete') {
            valilang.start();
        }
    }
    if (document.readyState === 'complete') {
        valilang.start();
    } else {
        if (document.addEventListener) {
            document.addEventListener('readystatechange', readyHandler, false);
        } else if (document.attachEvent) {
            document.attachEvent('onreadystatechange');
        }
    }
}(this, this.document));
