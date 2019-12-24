var dust = require('dust')();
var form = require('form');
var utils = require('utils');
var serand = require('serand');
var Configs = require('../service');

dust.loadSource(dust.compile(require('./template.html'), 'model-configs-create'));

var configs = {
    name: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please specify a title for your config');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done()
        }
    },
    value: {
        find: function (context, source, done) {
            serand.blocks('editor', 'find', source, function (err, value) {
                if (err) {
                    return done(err);
                }
                done(null, JSON.parse(value));
            });
        },
        validate: function (context, data, value, done) {
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.value', vform.elem);
            serand.blocks('editor', 'create', el, {
                value: value
            }, done);
        }
    }
};

var create = function (configsForm, config, done) {
    configsForm.find(function (err, data) {
        if (err) {
            return done(err);
        }
        configsForm.validate(data, function (err, errors, data) {
            if (err) {
                return done(err);
            }
            configsForm.update(errors, data, function (err) {
                if (err) {
                    return done(err);
                }
                if (errors) {
                    return done();
                }
                var o = {};
                if (config) {
                    o.id = config.id;
                }
                Object.keys(data).forEach(function (key) {
                    var value = data[key];
                    if (Array.isArray(value)) {
                        if (!value.length) {
                            return;
                        }
                        o[key] = data[key];
                        return;
                    }
                    if (value) {
                        o[key] = value;
                    }
                });
                var actions = config ? ['unpublish', 'edit', 'review', 'approve', 'publish'] : ['review', 'approve', 'publish'];
                utils.traverse('www', 'configs', actions, config, {
                    creator: function (created) {
                        Configs.create(o, created);
                    }
                }, done);
            });
        });
    });
};

var render = function (ctx, container, options, config, done) {
    var id = config && config.id;
    var sandbox = container.sandbox;
    var cont = _.cloneDeep(config || {});
    cont._ = {
        parent: container.parent
    };
    dust.render('model-configs-create', serand.pack(cont, container), function (err, out) {
        if (err) {
            return done(err);
        }
        var elem = sandbox.append(out);
        var configsForm = form.create(container.id, elem, configs);
        ctx.form = configsForm;
        configsForm.render(ctx, config, function (err) {
            if (err) {
                return done(err);
            }
            if (container.parent) {
                done(null, {
                    create: function (created) {
                        create(configsForm, config, function (err, data) {
                            if (err) {
                                return created(err);
                            }
                            created(null, null, data);
                        });
                    },
                    form: configsForm,
                    clean: function () {
                        $('.model-configs-create', sandbox).remove();
                    }
                });
                return;
            }
            sandbox.on('click', '.create', function (e) {
                create(configsForm, config, function (err) {
                    if (err) {
                        return console.error(err);
                    }
                    serand.redirect(options.location || '/configs');
                });
            });
            sandbox.on('click', '.cancel', function (e) {
                serand.redirect(options.location || '/configs');
            });
            done(null, {
                form: configsForm,
                clean: function () {
                    $('.model-configs-create', sandbox).remove();
                }
            });
        });
    });
};

module.exports = function (ctx, container, options, done) {
    options = options || {};
    var id = options.id;
    if (!id) {
        return render(ctx, container, options, null, done);
    }
    Configs.findOne(options, function (err, config) {
        if (err) {
            return done(err);
        }
        render(ctx, container, options, config, done);
    });
};



