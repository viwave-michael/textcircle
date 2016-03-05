this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient) {

  Template.navbar.helpers({
    documents: function() {
      return Documents.find();
    }
  });

  Template.editor.helpers({
    docid: function() {
      setupCurrentDocument();
      return Session.get('docid');
    },

    config: function() {
      return function(editor) {
        editor.setOption("lineNumbers", true);
        editor.setOption("mode", "html");
        editor.setOption("theme", "elegant");
        editor.on("change", function(editor, info) {
          var code = editor.getValue()
          $("#viewer_iframe").contents().find("html").html(code);
          Meteor.call("addEditingUser");
        });
      }
    }
  });

  Template.editingUsers.helpers({
    users: function() {
      var doc, editingUsers, users;
      doc = Documents.findOne();
      if (!doc) {
        return;
      }
      editingUsers = EditingUsers.findOne({docid: doc._id});
      if (!editingUsers) {
        return;
      }
      users = new Array();
      var i = 0;
      for (var user_id in editingUsers.users) {
        users[i] = fixObjectKey(editingUsers.users[user_id]);
        i++;
      }
      return users;
    }
  });

  ////////////
  // EVENTS
  ////////////

  Template.navbar.events({
    "click .js-add-doc": function(event) {
      event.preventDefault();
      console.log('add document');
      if (!Meteor.user()) {
        alert("You need to login first!");
      } else {
        Meteor.call("addDoc", function(err, id) {
          if (!err) {
            console.log('addDoc returns id: ' + id);
            Session.set('docid', id);
          } else {
            console.log('addDoc err: ' + err);
          }
        });
      }
    }
  });
} // end of isClient

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
  },
  addDoc: function() {
    var doc;
    if (!this.userId) {
      console.log("No login user found!");
      return;
    } else {
      doc = {
        owner: this.userId, createdOn: new Date(),
        title: "New Document"
      };
      var res = Documents.insert(doc);
      console.log("addDoc insert result: " + res);
      return res;
    }
  }
});

function fixObjectKey(obj) {
  var newObj = {};
  for (key in obj) {
    var key2 = key.replace("-", "_");
    newObj[key2] = obj[key];
  }
  return newObj;
}

function setupCurrentDocument() {
  var doc;
  if (!Session.get('docid')) {
    doc = Documents.findOne();
    if (doc) {
      Session.set('docid', doc._id);
    }
  }
}