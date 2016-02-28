this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");

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
          Meteor.call("addEditingUser");
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

Meteor.methods({
  // To construct data:
  // {
  //   "_id" : "xxx",
  //   "docid" : "xxx",
  //   "users" : {
  //     "userid..." : {"first-name":"xxx", ..., "lastEdit":"xxx"},
  //     "userid..." : {"first-name":"xxx", ..., "lastEdit":"xxx"},
  //     "userid..." : {"first-name":"xxx", ..., "lastEdit":"xxx"}
  //   }
  // }
  addEditingUser: function() {
    var doc, user, editingUsers;
    doc = Documents.findOne();
    if (!doc) {
      return;
    }
    if (!this.userId) {
      return;
    }
    user = Meteor.user().profile;

    editingUsers = EditingUsers.findOne({docid:doc._id});
    if (!editingUsers) {
      editingUsers = {
        docid: doc._id,
        users: {}
      };
    }
    user.lastEdit = new Date();
    editingUsers.users[this.userId] = user
    EditingUsers.upsert({_id: editingUsers._id}, editingUsers);
  }
});