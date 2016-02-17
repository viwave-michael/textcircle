this.Documents = new Mongo.Collection("documents");

if (Meteor.isClient) {
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (!Documents.findOne()) {
      Documents.insert({title: "New document"});
    }
  });
}
