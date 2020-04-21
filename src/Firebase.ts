import * as firebase from 'firebase';

const settings = {
};

let config;
try {
  // eslint-disable-next-line global-require
  config = require('../config/Firebase.config.json');
} catch (err) {
  console.error('Missing firebase config file');
  config = {
    apiKey: '',
    databaseURL: '',
    projectId: '',
  };
}

firebase.initializeApp(config);

firebase.firestore().settings(settings);

export default firebase;
