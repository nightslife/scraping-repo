var express = require("express");
var mongoose = require("mongoose");
var db = require("./models");
var cheerio = require("cheerio");
var axios = require("axios");
var mongojs = require("mongojs")

// Initialize Express
var app = express();
var PORT = process.env.PORT || 8000;
// Establishing Handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("views", __dirname + '/views')
app.set("partials", __dirname + '/partials')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Mongo DB connection
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

app.get("/", (req, res) => {
    db.Article.find({})
    .then((data) => {
        res.render("index", {article: data});
        console.log(data);
    })
    

});


//Scrape
app.get("/scrape", (req, res) => {
    var results = {};
    axios.get("https://www.nytimes.com/").then((response) => {
        
        var $ = cheerio.load(response.data);
        
        $("article").each((i, element) => {
            //Capture link to article
            results.link = "https://www.nytimes.com" + $(element).find("a").attr("href");
            //Capture the title of the article within the h2 element.
            results.title = $(element).find("h2").text() || $(element).find("h2").children().text();
            results.summ = $(element).find("li").text() || $(element).find("p").text();
            
            db.Article.create(results)
            .then((dbArticles) => {
                console.log(dbArticles);
                
            })
            .catch((err) => {
                console.log(err);
            });
        })
        res.redirect("/")
    });
});
//JSON
app.get("/all", (req, res) => {
    db.Article.find({}, (err, data)=>{
        if(err){
            console.log(err)
        }else{
            res.json(data)
        }
    })
});
//Save Article
app.get("/saveArticle/:id", (req, res)=>{
    const articleId = req.params.id;
    
    db.Article.findOneAndUpdate(
        {
            _id: mongojs.ObjectId(articleId)
        },
        {
            $set:
            { 
                isSaved: true
            }
        }, (err, data)=>{
            if(err){
                console.log(err)
            }else{
                console.log(data);
                res.redirect("/")
            }
        }
    )
    
})
//Delete Saved-state of Article
app.get("/removeArticle/:id", (req, res)=>{
    const articleId = req.params.id;
    
    db.Article.findOneAndUpdate(
        {
            _id: mongojs.ObjectId(articleId)
        },
        {
            $set:
            { 
                isSaved: false
            }
        }, (err, data)=>{
            if(err){
                console.log(err)
            }else{
                console.log(data);
                res.redirect("/saved")
            }
        }
    )
    
})
//Get all Saved Articles
app.get("/saved", (req, res) => {
    db.Article.find({isSaved: true})
    .then((data)=>{
        res.render("saved", {articles: data})
        console.log(data)
    })
    .catch((err)=>{
        console.log(err)
    })
});
//Empty database to remove all articles
app.get("/clear", (req, res) => {
    db.Article.collection.drop()
    .then(()=>{
        res.redirect("/")
    })
})
//Get specific article
app.get("/article/:id"), (req, res)=>{
    const articleId = req.params.id;
    console.log(articleId)
    // db.Article.findById(articleId)
    //     .populate("note")
    //     .then((err, data)=>{
    //         console.log(data)
    //         if(err){
    //             console.log(err)

           
    //        }else{
    //             res.render("article" + {id: data})
    //        }
    //     })

}


app.listen(PORT, function() {
    console.log("App running on port "+ PORT + "!");
});