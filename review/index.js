var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var Page = require('../service');

dust.loadSource(dust.compile(require('./template'), 'model-configs-review'));

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    Page.findOne({id: options.id}, function (err, config) {
        if (err) {
            return done(err);
        }
        config = serand.pack(config, container);
        dust.render('model-configs-review', config, function (err, out) {
            if (err) {
                return done(err);
            }
            sandbox.append(out);
            $('.config-ok', sandbox).on('click', function () {
                var thiz = $(this);
                utils.loading();
                utils.publish('configs', config, function (err) {
                    utils.loaded();
                    if (err) {
                        return console.error(err);
                    }
                    thiz.removeClass('text-primary').addClass('text-success')
                        .siblings('.config-bad').addClass('hidden');

                    setTimeout(function () {
                        serand.redirect(options.location || '/configs');
                    }, 500);
                });
            });

            $('.config-bad', sandbox).on('click', function () {
                serand.redirect(options.location || '/configs');
            });
            done(null, function () {
                $('.model-configs-review', sandbox).remove();
            });
        });
    });
};
