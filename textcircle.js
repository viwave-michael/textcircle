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
        editor.setOption("lineNumbers", true);
        editor.setOption("mode", "html");
        editor.on("change", function(editor, info) {
          var code = editor.getValue()
          $("#viewer_iframe").contents().find("html").html(code);
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
