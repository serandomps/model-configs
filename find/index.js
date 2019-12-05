var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var Page = require('../service');

dust.loadSource(dust.compile(require('./template.html'), 'model-configs-find'));

module.exports = function (ctx, container, options, done) {
    Page.find({}, function (err, data) {
        if (err) {
            return done(err);
        }
        var sandbox = container.sandbox;
        dust.render('model-configs-find', serand.pack({
            title: options.title,
            size: 6,
            configs: data
        }, container), function (err, out) {
            if (err) {
                return done(err);
            }
            sandbox.append(out);
            done(null, function () {
                $('.model-configs-find', sandbox).remove();
            });
        });
    });
};
