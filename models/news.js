var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    link: {
        type: String,
        required: true,
        unique: true
    },
    summ: {
        type: String,
        required: true,
        unique: true
    },
    notes: {
        type:Schema.Types.ObjectId,
        ref: "Notes"
    }, 
    isSaved: {
        type: Boolean,
        default: false
    },
    href: String

});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;