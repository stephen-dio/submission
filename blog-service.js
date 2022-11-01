const fs = require('fs');

var employees = [], departments = [], posts = [], categories = [];

initialize = () => {
    return new Promise((resolve, reject) => {
        try {
            fs.readFile('./data/posts.json', (err, data) => {
                if (err) throw err;
                posts = JSON.parse(data)
            })
            fs.readFile('./data/categories.json', (err, data) => {
                if (err) throw err;
                categories = JSON.parse(data)
            })
        }
        catch (err) {
            reject("error reading json file(s)")
            console.log(err)
        }
        resolve("intialized")
    })
}

getAllCategories = () => {
    return new Promise((resolve, reject) => {
        try {
            if (categories.length <= 0) {
                reject("categories length <= 0")
            } 
        }
        catch (err) {
            reject("error getting categories")
        }
        resolve(categories)
    })
}

getAllPosts = () => {
    return new Promise((resolve, reject) => {
        try {
            if (posts.length <= 0) {
                reject("posts length <= 0")
            }
        }
        catch (err) {
            reject("error getting posts")
        }
        resolve(posts)
    })
}

getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        var categoryPosts = {};
        try {
            categoryPosts = posts.filter(post => post.category == category);
            if (categoryPosts.length <= 0) {
                reject("category posts length <= 0")
            }
        }
        catch (err) {
            reject("error getting category posts")
            console.log("rejected")
        }        

        resolve(categoryPosts)
    })
}

getPostsByMinDate = (minDateStr) => {

    return new Promise((resolve, reject) => {
        var minDatePosts = [];
        try {
            const minDate = new Date(minDateStr);
            minDatePosts = posts.filter(post => 
                Date.parse(post.postDate) >= Date.parse(minDateStr)
            );
            if (minDatePosts.length <= 0) {
                reject("posts at min length <= 0")
            }
        }
        catch (err) {
            reject("error getting posts at min length")
        }
        resolve(minDatePosts)
    })
}

getPostById = (id) => {
    return new Promise((resolve, reject) => {
        try {
            for (let i = 0; i < posts.length; i++) {
//                console.log(`check: ${posts[i].id} == ${id}`)
                if (posts[i].id == id) {
//                    console.log("HIT!")
                    resolve(posts[i])
                    break;
                }
            }
            reject(`post with id ${id} not found`)
        }
        catch (err) {
            reject("error getting posts")
        }
    })
}

addPost = (postData) => {
    return new Promise ((resolve, reject) => {

        if (!postData.published) {
            postData.published = true;
        }

        postData.id = (posts.length + 1);

        const today = new Date();
        postData.postDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
        console.log("Post Date: ")
        console.log(postData.postDate)

        try {
            posts.push(postData);
        }
        catch (err) {
            reject("error pushing data")
        }
//        console.log(`Posts working! Post: ${postData}`);
        resolve(postData);
    });
}

getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        var categoryPosts = {};
        try {
            categoryPosts = posts.filter(post => post.category == category && post.published == true);
            if (categoryPosts.length <= 0) {
            reject("category posts length <= 0")
            }
        }
        catch (err) {
            reject("error getting category posts")
        }     
        console.log("Category Posts")
        console.log(categoryPosts)
        resolve(categoryPosts)
   
    }) 
}

getPublishedPosts = (category) => {
    return new Promise((resolve, reject) => {
        var categoryPosts = [];
        try {
            categoryPosts = posts.filter(post => post.published == true);
            if (categoryPosts.length <= 0) {
                reject("category posts length <= 0")
            } 
        }
        catch (err) {
            reject("error getting category posts")
        }
        resolve(categoryPosts)
    }) 
}

module.exports = {
    initialize,
    getAllPosts,
    getAllCategories,
    getPostById,
    getPostsByMinDate,
    getPostsByCategory,
    addPost,
    getPublishedPostsByCategory,
    getPublishedPosts
}