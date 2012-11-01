(function () {
    "use strict";
    var rValilang = /valilang/,
        rWhitespace = /^\s+$/;
    function Parser() {
        return {
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
                            this.parse(json);
                        }
                    }
                }
            },
            error: function (script_location, error_desc) {
                console.error('Error in '+script_location+': '+error_desc);
            },
            addRemote: function (src) {
                console.error(src, 'Remote loading not yet implemented.');
            },
            parse: function (json, script_location) {
                var rules = {},
                    fields = [],
                    filedata,
                    i;
                try {
                    filedata = JSON.parse(json);
                } catch (e) {
                    this.error(script_location, e);
                }
                fields = filedata.fields;
                if (fields === undefined) {
                    this.error(script_location, e);
                    return;
                }
                for (i=0; i<fields.length; i++) {
                    console.log(fields[i]);
                    console.log(filedata.fieldValidation[fields[i]]);
                }
            }
        };
    };
})();
