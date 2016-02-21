this.Documents = new Mongo.Collection("documents");


if (Meteor.isClient) {

  Template.editor.helpers({
    docid: function() {
      var doc = Documents.findOne();
      if (doc) {
        return Documents.findOne()._id;
      } else {
        return undefined;
      }
    },

    config: function() {
      return function(editor) {
        editor.on("change", function(editor, info) {
          console.log(editor.getValue());
        });
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (!Documents.findOne()) {
      Documents.insert({title: "New document"});
    }
  });
}
