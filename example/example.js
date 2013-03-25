var ListItem = Backbone.Model.extend({});
var List = Backbone.Collection.extend({
  model: ListItem
});

var CollectionView = Backbone.View.extend({
  tagName: 'ul',
  className: 'thumbnails',
  views: {},
  selected: [],
  actionBar: null,
  contextBar: null,

  initialize: function (options) {
    this.collection = options.collection;
    this.listenTo(this.collection, 'add', this.addItem);
    this.listenTo(this.collection, 'remove', this.removeItem);
    this.listenTo(this.collection, 'reset', this.render);
    this.prepareActionBar();
  },

  render: function () {
    this.views = {};
    this.collection.each(this.addItem, this);
    this.renderActionBar();
    return this;
  },

  prepareActionBar: function () {
    this.actionBar = new ActionBar({
      control: {
        icon: 'briefcase',
        label: 'Messages'
      },
      actions: [
        {
          id: 'add',
          icon: 'plus',
          label: 'Add new',
          action: this.addNew
        }
      ]
    }, this);
  },

  prepareContextBar: function () {
    this.contextBar = new ContextBar({
      control: {
        label: '1 selected',
        icon: 'ok',
        action: this.unselectAll
      },
      actions: [
        {
          id: 'copy',
          icon: 'copy',
          label: 'Copy',
          action: this.copySelected
        },
        {
          id: 'remove',
          icon: 'trash',
          label: 'Remove',
          action: this.removeSelected
        }
      ]
    }, this);
  },

  renderActionBar: function () {
   this.actionBar.show();
  },

  addItem: function (item) {
    var self = this;
    var view = new ItemView({
      model: item,
      select: function () {
        self.selectItem(item);
      },
      unselect: function () {
        self.unselectItem(item);
      }
    });
    this.$el.append(view.render().el);
    this.views[item.cid] = view;
  },

  removeItem: function (item) {
    if (!this.views[item.cid]) {
      return;
    }

    this.views[item.cid].$el.remove();
    delete this.views[item.cid];
  },

  selectItem: function (item) {
    this.selected.push(item);
    if (!this.contextBar) {
      this.prepareContextBar();
      this.actionBar.hide();
      this.contextBar.show();
    }
    this.contextBar.get('control').set('label', this.selected.length + ' selected');
   
    if (this.selected.length > 1) {
      this.contextBar.get('actions').get('copy').set('disabled', true);
    }
  },

  unselectItem: function (item) {
    var idx = this.selected.indexOf(item);
    if (idx === -1) {
      return;
    }
    this.selected.splice(idx, 1);
    if (!this.contextBar) {
      return;
    }
    if (this.selected.length === 0) {
      this.contextBar.hide();
      this.contextBar = null;
      this.renderActionBar();
      return;
    }
    this.contextBar.get('control').set('label', this.selected.length + ' selected');

    if (this.selected.length === 1) {
      this.contextBar.get('actions').get('copy').set('disabled', false);
    }
  },

  unselectAll: function () {
    if (this.selected.length === 0) {
      return;
    }

    _.each(this.selected, function (item) {
      var self = this;
      window.setTimeout(function () {
        self.unselectItem(item);
      }, 0);
    }, this);
    Backbone.$('li.active', this.el).removeClass('active');
  },

  addNew: function () {
    this.collection.add({
      title: 'New item'
    });
  },

  copySelected: function () {
    this.collection.add(this.selected[0].toJSON());
  },

  removeSelected: function () {
    _.each(this.selected, function (item) {
      this.collection.remove(item);
    }, this);
    this.selected = [];
    this.contextBar.hide();
    this.contextBar = null;
    this.renderActionBar();
  }
});

var ItemView = Backbone.View.extend({
  tagName: 'li',
  className: 'span4',
  template: '<div class="thumbnail"><h3><%= title %></h3></div>',
  selected: false,

  events: {
    'click': 'handleSelect'
  },

  initialize: function (options) {
    this.select = options.select;
    this.unselect = options.unselect;
    this.listenTo(this.model, 'change', this.render);
  },

  handleSelect: function () {
    if (this.selected) {
      this.$el.removeClass('active');
      this.unselect();
      this.selected = false;
      return;
    }
    this.$el.addClass('active');
    this.select();
    this.selected = true;
  },

  render: function () {
    var data = this.model.toJSON();
    var html = _.template(this.template, data);
    this.$el.html(html);
    return this;
  }
});

$(document).ready(function () {
  // Populate data
  var myItems = new List([
    {
      title: 'First'
    },
    {
      title: 'Second'
    },
    {
      title: 'Third'
    }
  ]);

  // Render it
  var myView = new CollectionView({
    collection: myItems
  });
  $('.container').append(myView.render().el);

});
