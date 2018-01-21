var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var itemSchema = new Schema({
  imageUri: {type: String, required: true},
  title: {type: String, required: true},
  description: {type: String, required: true},
  price: {type: Number}
});

module.exports = mongoose.model('ItemSchema', itemSchema);
