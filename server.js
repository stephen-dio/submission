/*********************************************************************************
*  WEB322 – Assignment 1
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Stephen Dionola Student ID: 116345208 Date: Oct 17, 2022
*
*  Online (Heroku) URL: https://web322assign3.herokuapp.com/
*
********************************************************************************/ 

    // res.send("Stephen Dionola - 116345208");

const path = require('path');
const dataService = require("./blog-service");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();

cloudinary.config({
    cloud_name: 'duhl6p3uh',
    api_key: '455584371327362',
    api_secret: 'teRlKHjbM4DntMf1hBKguLR-Lgw',
    secure: true
})

const upload = multer(); 

app.use(express.static('public')); 
// app.use('/public', express.static(path.join(__dirname, 'css')))

app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
        return '<li' + 
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        } 
    }
}));
app.set('view engine', '.hbs');


// nav middleware
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
        app.locals.viewingCategory = req.query.category;
    // console.log("viewingCategory")
    // console.log(app.locals.viewingCategory );
    next();
});

app.get("/", (req, res) => {
    res.redirect("/blog");
});

app.get('/blog', async (req, res) => {
    let viewData = {};

    try{
        let posts = [];

        if(req.query.category){
            posts = await dataService.getPublishedPostsByCategory(req.query.category);
        }else{
            posts = await dataService.getPublishedPosts();
        }

        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        let post = posts[0]; 

        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        let categories = await dataService.getAllCategories();

        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {

    // console.log("Testing, attention please\n")
    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await dataService.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await dataService.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await dataService.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await dataService.getAllCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {style: `${path.join(__dirname, '/public/css/site.css')}`, data: viewData})
});

app.get("/about", (req, res) => {
//    res.sendFile(path.join(__dirname, '/views/about.html'));
res.render("about");
});

app.get("/posts", (req, res) => {
//    console.log(`req query: ${req.query}`)
        if (req.query.category) {
            dataService.getPostsByCategory(req.query.category)
                .then((e) => res.render("posts", {posts:e}))
                .catch((err) => res.render("posts", {message: "no results - category"}))
        }
        else if (req.query.minDate) {
            dataService.getPostsByMinDate(req.query.minDate)
                .then((e) => res.render("posts", {posts:e}))
                .catch(err => res.render("posts", {message: "no results - minDate"}))
        }
        else {
            dataService.getAllPosts()
                .then((e) => res.render("posts", {posts:e}))
                .catch((err) => res.render("posts", {message: "no results - getAllPosts"}))

        }
});

app.get("/categories", (req, res) => {
    dataService.getAllCategories()
        .then((e) => res.render("categories", {categories:e}))
        .catch((err) => res.render("categories", {message: "no results - getAllCategories"}))
});

app.get("/posts/add", (req, res) => {
    // res.sendFile(path.join(__dirname, '/views/addPost.html'));
    res.render("addPost");
});

app.get("/posts/:id", (req, res) => {
    dataService.getPostById(req.params.id)
        .then((e) => res.json(e))
        .catch((err) => res.json( {message: err}))
})

app.get("/posts?minDate=:value", (req, res) => {
    dataService.getPostsByMinDate(req.query.value)
        .then((e) => res.json(e))
        .catch((err) => res.json( {message: err}))
})

app.post("/posts/add", upload.single("featureImage"), (req, res) => {

    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        // console.log(result);
        return result;
    }

    upload(req).then((uploaded)=>{
        req.body.featureImage = uploaded.url;

        dataService.addPost(req.body).then (() => {
            try {
                res.redirect('/posts')
            }
            catch (err) {
                console.log(err);
                // 
            }
        })
    });
});

app.use((req, res) => {
    res.status(404).render("404")
})

dataService.initialize().then(
    app.listen(HTTP_PORT, () => {
    console.log(`Express http server listening on ${HTTP_PORT}`);
}));
