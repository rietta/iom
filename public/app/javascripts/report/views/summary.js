'use strict';

define([
  'backbone',
  'handlebars',
  'models/report',
  'text!templates/summary.handlebars'
], function(Backbone, Handlebars, ReportModel, tpl) {

  var SummaryView = Backbone.View.extend({

    el: '#summaryView',

    template: Handlebars.compile(tpl),

    events: {
      'click .btn-show-list': 'showList'
    },

    initialize: function() {
      Backbone.Events.on('filters:fetch', this.hide, this);
      Backbone.Events.on('filters:done', this.showSummary, this);
    },

    render: function() {
      this.$el.html(this.template(this.data));
    },

    showSummary: function() {
      this.data = ReportModel.instance.toJSON();

      this.render();

      this.$el.removeClass('is-hidden');
    },

    showList: function(e) {
      e.preventDefault();

      Backbone.Events.trigger('list:show', $(e.currentTarget).data('list'));
    },

    hide: function() {
      this.$el.addClass('is-hidden');
    }

  });

  return SummaryView;

});