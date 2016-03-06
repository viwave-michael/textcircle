this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient) {

  Meteor.subscribe('documents');
  Meteor.subscribe('editingUsers');

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

  Template.docMeta.helpers({
    document: function() {
      return Documents.findOne({_id: Session.get('docid')});
    }
  });

  Template.editableText.helpers({
    userCanEdit: function() {
      console.log('docid: ' + Session.get('docid'));
      console.log('userId: ' + Meteor.userId());
      doc = Documents.findOne({_id: Session.get('docid')});
      if (doc) {
        if (doc.owner == Meteor.userId()) {
          return true;
        }
      }
      return false;
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
    },
    "click .js-load-doc": function(event) {
      // this is a document.
      console.log(this);
      Session.set('docid', this._id);
    }
  });

  Template.docMeta.events({
    "click .js-toggle-private": function(event) {
      console.log(event.target.checked);
      var doc = { _id: Session.get('docid'), is_private: event.target.checked };
      Meteor.call('updateDocPrivacy', doc);
    }
  });
} // end of isClient

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (!Documents.findOne()) {
      Documents.insert({title: "New document"});
    }
  });

  Meteor.publish('documents', function() {
    return Documents.find({is_private: false});
  });

  Meteor.publish('editingUsers', function() {
    return EditingUsers.find();
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
        title: "New Document",
        is_private: false
      };
      var res = Documents.insert(doc);
      console.log("addDoc insert result: " + res);
      return res;
    }
  },
  updateDocPrivacy: function(_doc) {
    console.log('updateDocPrivacy');
    console.log(_doc);
    var doc = Documents.findOne({_id: _doc._id, owner: this.userId});
    if (doc) {
      doc.is_private = _doc.is_private;
      Documents.update({_id: doc._id}, doc);
    } else {
      console.warn("Cannot find document or you are not the owner");
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