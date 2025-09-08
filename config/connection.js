const { MongoClient } = require('mongodb');

const state = { db: null };

module.exports.connect = function (done) {
  const url = process.env.MONGO_URI;
  const dbname = 'shopping';

  MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,   // force TLS
    tls: true,
  })
    .then((client) => {
      state.db = client.db(dbname);
      done();
    })
    .catch((err) => {
      done(err);
    });
};

module.exports.get = function () {
  return state.db;
};
