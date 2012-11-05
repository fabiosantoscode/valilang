Valilang
========
Create validation rules in a single format, meant to be used in both client and server sides.


The problem
-----------
In web applications and websites, form validation is boring since (if you want to have neat web forms) you have to do it twice: On the server side, and on the client side, in Javascript. To make matters worse, you often find yourself repeating code time and time again.


The solution
------------
Valilang is based upon JSON (for portability), and using it you will be able to define a set of validation rules for each of your form fields.

```html
<script type="text/x-valilang">
    {
        "fields": ["name",  "email", "recipients"],
        "fieldValidation": {
            "name": [
                "required",
                "min-10",
                "max-50",
                "split",
                "listmax-2"
            ],
            "email": [
                "required",
                "min-3",
                "max-60",
                "email"
            ],
            "recipients": [
                "required",
                "split-,; ",
                "listmin-1",
                "email"
            ]
        }
    }
</script>
<script type="text/javascript" src="valilang.js"></script>
```

By creating a validation rules file and then including it from your page using a script tag, along with valilang.js, you have the client side covered. By default, valilang binds event handlers to `keyup`, for better responsiveness, however you will be able to change this.

Developers will be able to create new rules (and only create client and serverside code for those rules), but a lot of predefined rules will be set in place.


Current state
-------------
Valilang is still under development. The format is not well defined, and server side libraries for several languages are not in place yet. However, I could certainly use some help. If you are interested in helping, fork and pull request!

If you want to create a port of valilang to a certain framework or language, create a github repository, and open an issue in the [valilang tracker][issues_url].

 [issues_url]: https://github.com/fabiosantoscode/valilang/issues