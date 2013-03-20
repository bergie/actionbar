(function(Backbone) {
  var ensure = function (obj, key, type) {
    if (!obj[key]) {
      obj[key] = new type();
    }
    if (!(obj[key] instanceof type)) {
      obj[key] = new type(obj[key]);
    }
  };

  var ActionItem = Backbone.Model.extend({
    defaults: {
      action: null,
      label: '',
      disabled: false,
      icon: ''
    }
  });

  var ActionList = Backbone.Collection.extend({
    model: ActionItem
  });

  var ActionBar = Backbone.Model.extend({
    view: null,

    defaults: {
      control: null,
      actions: null,
      overflow: null
    },

    initialize: function () {
      ensure(this.attributes, 'control', ActionItem);
      ensure(this.attributes, 'actions', ActionList);
      ensure(this.attributes, 'overflow', ActionList);
    },

    render: function () {
       this.view = new ActionBarView({
        model: this
      });
      return this.view.render().el;
    },

    show: function () {
      var bar = this.render();
      Backbone.$('body').prepend(bar);
    },

    hide: function () {
      if (!this.view) {
        return;
      }
      this.view.$el.remove();
      this.view = null;
    }
  });

  var ContextBar = Backbone.Model.extend({
    view: null,

    defaults: {
      control: null,
      actions: null
    },

    initialize: function () {
      ensure(this.attributes, 'control', ActionItem);
      ensure(this.attributes, 'actions', ActionList);
    },

    render: function () {
      this.view = new ContextBarView({
        model: this
      });
      return this.view.render().el;
    },

    show: function () {
      var bar = this.render();
      Backbone.$('body').prepend(bar);
    },

    hide: function () {
      if (!this.view) {
        return;
      }
      this.view.$el.remove();
      this.view = null;
    }
  });

  var ActionBarView = Backbone.View.extend({
    tagName: 'div',
    className: 'navbar navbar-fixed-top',
    template: '<div class="navbar-inner"></div>',
    $inner: null,
    $control: null,
    $actions: null,

    initialize: function () {
      this.listenTo(this.model.get('control'), 'change', this.renderControl);
    },

    render: function () {
      this.$el.html(this.template);
      this.$inner = Backbone.$('.navbar-inner', this.$el);
      this.$control = null;
      this.$actions = null;
      this.renderControl();
      this.renderActions();
      this.renderOverflow();
      return this;
    },

    renderControl: function () {
      if (!this.$control) {
        this.$control = Backbone.$('<a>');
        this.$control.addClass('brand');
        this.$inner.prepend(this.$control);
      }
      var icon = this.model.get('control').get('icon');
      var label = this.model.get('control').get('label');
      this.$control.empty();
      if (icon) {
        this.$control.append(Backbone.$('<i class="icon-' + icon + '"></i>'));
      }
      if (label) {
        this.$control.append(' ' + label);
      }
    },

    renderActions: function () {
      if (this.$actions) {
        return;
      }
      var view = new ActionListView({
        collection: this.model.get('actions')
      });
      this.$inner.append(view.render().$el);
      this.$actions = view.$el;
    },

    renderOverflow: function () {
    }
  });

  var ContextBarView = Backbone.View.extend({
    tagName: 'div',
    className: 'navbar navbar-inverse navbar-fixed-top',
    template: '<div class="navbar-inner"></div>',
    $inner: null,
    $control: null,
    $actions: null,

    initialize: function () {
      this.listenTo(this.model.get('control'), 'change', this.renderControl);
    },

    render: function () {
      this.$el.html(this.template);
      this.$inner = Backbone.$('.navbar-inner', this.$el);
      this.$control = null;
      this.$actions = null;
      this.renderControl();
      this.renderActions();
      return this;
    },

    renderControl: function () {
      if (!this.$control) {
        this.$control = Backbone.$('<a>');
        this.$control.addClass('brand');
        this.$inner.prepend(this.$control);
      }
      var icon = this.model.get('control').get('icon');
      var label = this.model.get('control').get('label');
      this.$control.empty();
      if (icon) {
        this.$control.append(Backbone.$('<i class="icon-' + icon + '"></i>'));
      }
      if (label) {
        this.$control.append(' ' + label);
      }
    },

    renderActions: function () {
      if (this.$actions) {
        return;
      }
      var view = new ActionListView({
        collection: this.model.get('actions')
      });
      this.$inner.append(view.render().$el);
      this.$actions = view.$el;
    }
  });

  var ActionListView = Backbone.View.extend({
    tagName: 'ul',
    className: 'nav pull-right',
    views: {},

    initialize: function (options) {
      this.collection = options.collection;
      this.listenTo(this.collection, 'add', this.addItem);
      this.listenTo(this.collection, 'remove', this.removeItem);
      this.listenTo(this.collection, 'reset', this.render);
    },

    render: function () {
      this.$el.empty();
      this.collection.each(this.addItem, this);
      return this;
    },

    addItem: function (action) {
      var view = new ActionItemView({
        model: action
      });
      this.$el.append(view.render().el);
      this.views[action.id] = view;
    },

    removeItem: function (action) {
      if (!this.views[action.id]) {
        return;
      }

      this.views[action.id].$el.remove();
      delete this.views[action.id];
    }
  });

  var ActionItemView = Backbone.View.extend({
    tagName: 'li',
    template: '<a></a>',
    
    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    },

    render: function () {
      this.$el.html(this.template);
      var $btn = Backbone.$('a', this.$el);
      $btn.append(Backbone.$('<i class="icon-' + this.model.get('icon') + '"></i>'));
      return this;
    }
  });

  window.ActionBar = ActionBar;
  window.ContextBar = ContextBar;
})(Backbone);
