var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');

dust.loadSource(dust.compile(require('./template.html'), 'configs-findone'));

var findOne = function (id, done) {
    $.ajax({
        method: 'GET',
        url: utils.resolve('accounts:///apis/v/configs/' + id),
        dataType: 'json',
        success: function (data) {
            done(null, data);
        },
        error: function (xhr, status, err) {
            done(err || status || xhr);
        }
    });
};

module.exports = function (ctx, container, options, done) {
    findOne(options.id, function (err, data) {
        if (err) {
            return done(err);
        }
        var sandbox = container.sandbox;
        dust.render('configs-findone', serand.pack({
            name: data.name
        }, container), function (err, out) {
            if (err) {
                return done(err);
            }
            var el = sandbox.append(out);
            var editor = ace.edit($('.config-body', el)[0]);
            editor.setOptions({
                maxLines: Infinity,
                showLineNumbers: false,
                theme: 'ace/theme/textmate',
                mode: 'ace/mode/json',
                readOnly: true,
                showGutter: false,
                highlightActiveLine: false,
                showPrintMargin: false
            });
            editor.setValue(JSON.stringify(data.value, null, 2), -1);
            done(null, {
                clean: function () {
                    $('.configs-findone', sandbox).remove();
                },
                ready: function () {

                }
            });
        });
    });
};
