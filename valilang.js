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
    var rValilang = /valilang/,
        rWhitespace = /^\s+$/,
        rRuleWithArguments = /^([a-zA-Z_0-9]+)-(.*?)$/,
        rRuleWithoutArguments = /^([a-zA-Z_0-9]+)$/,
        valilang,
        defaultRules;
    defaultRules = {
        email: function () {
            function validator(email) {
                var email_re = /^\S+@\S+\.\S+$/;
                return email_re.test(email) ? email : null;
            }
            return validator;
        }
    };
    valilang = window.valilang = {
        rules: {},
        start: function () {
            var scripts = document.getElementsByTagName("script"),
                script,
                i;
            for (i = 0; i < scripts.length; i++) {
                script = scripts[i];
                if (rValilang.test(script.type)) {
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
        parse: function (json, script_location) {
            var fields = [],
                field_rules = [],
                func,
                filedata,
                rule_strings,
                i,
                j,
                regexResult,
                rule,
                args;
            try {
                filedata = JSON.parse(json);
            } catch (e) {
                this.parseError(script_location, e);
            }
            fields = filedata.fields;
            if (fields === undefined) {
                this.parseError(script_location, '"fields" list expected.');
                return;
            }
            for (i = 0; i < fields.length; i++) {
                if (filedata.fieldValidation[fields[i]] !== undefined) {
                    rule_strings = filedata.fieldValidation[fields[i]];
                    for (j = 0; j < rule_strings.length; j++) {
                        regexResult = rRuleWithArguments.exec(rule_strings[j]);
                        if (regexResult) {
                            rule = regexResult[1];
                            args = regexResult[2];
                        } else {
                            regexResult = rRuleWithoutArguments.exec(rule_strings[j]);
                            if (regexResult) {
                                rule = regexResult[1];
                                args = undefined;
                            } else {
                                this.parseError(script_location, 'Invalid rule: ' + rule_strings[j]);
                            }
                        }
                        func = this.getRule(rule);
                        if (func !== undefined) {
                            field_rules.push(func(args));
                        } else {
                            console.warn('valilang: Rule "' + rule + '" not found');
                        }
                    }
                    this.addHandlers(fields[i], field_rules);
                    field_rules = [];
                }
            }
        },
        getRule: function (rule_name) {
            return defaultRules[rule_name];
        },
        addHandlers: function (elmName, rules) {
            var elm = document.getElementsByName(elmName)[0],
                i,
                handlerFunc = function () {
                    for (i = 0; i < rules.length; i++) {
                        console.log(rules[i]);
                    }
                };
            if (elm === undefined) {
                console.warn('field named "' + elmName + '" not found');
            } else {
                if (elm.addEventListener) {
                    elm.addEventListener('keyup', handlerFunc, false);
                } else if (elm.attachEvent) {
                    elm.attachEvent('onkeyup', handlerFunc);
                }
            }
        }
    };
    function readyHandler (e) {
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
