var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var Page = require('../service');

dust.loadSource(dust.compile(require('./template'), 'model-configs-remove'));

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    Page.findOne({id: options.id}, function (err, config) {
        if (err) return done(err);
        dust.render('model-configs-remove', serand.pack(config, container), function (err, out) {
            if (err) {
                return done(err);
            }
            var el = sandbox.append(out);
            $('.remove', el).on('click', function () {
                Page.remove(config, function (err) {
                    if (err) {
                        return console.error(err);
                    }
                    serand.redirect('/configs');
                });
            });
            done(null, function () {
                $('.model-configs-remove', sandbox).remove();
            });
        });
    });
};
