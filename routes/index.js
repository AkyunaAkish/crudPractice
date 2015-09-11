var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/crudpuppies');
var posts = db.get('posts');
// var comments = db.get('comments');

/* GET home page. */
router.get('/', function (req, res, next) {
  posts.find({}, function (err, docs) {
    // console.log(docs);
    res.render('index', {posts: docs});
  })

});


router.get('/posts/new', function (req, res, next) {
  res.render('new', {title: 'New Page'});
});

router.post('/', function (req, res, next) {
  if (!req.body.posts) {
    res.render('new', {newError: 'You must fill in the input field.'});
  }
  else {
    req.body.comments = [];
    posts.insert(req.body);
    res.redirect('/');

  }
});


router.post('/posts/:postId/comments/:commentId/delete', function(req,res,next){
  posts.findOne({_id: req.params.postId}, function(err,doc){
    var a = req.url.split('/');
    var b = a.length -2;

    var idFilter = doc.comments.filter(function(comment){
      return comment.commentId != a[b];
    })

    doc.comments = idFilter;
    posts.update({_id: req.params.postId}, doc, function(err, doc) {
      res.redirect('/posts/' + req.params.postId)
    })
  })
})

router.get('/posts/:id/comment/:commentId', function(req,res,next){
  var a = req.url.split('/');
  var b = a.length -1;
  posts.findOne({_id: req.params.id}, function (err, doc) {
    var idFilter = doc.comments.filter(function(comment){
      return comment.commentId == a[b];
    })
    res.render('commentShow', {comment: idFilter[0], postId: doc._id});

  })
})



router.get('/posts/:id', function (req, res, next) {
  posts.findOne({_id: req.params.id}, function (err, doc) {
    res.render('show', {posts: doc});

  })
});

router.get('/posts/:id/edit', function (req, res, next) {
  posts.findOne({_id: req.params.id}, function (err, doc) {

    if (err) throw err

    res.render('edit', doc)

  })
});

router.post('/posts/:id/comments', function(req,res,next){
  posts.findOne({_id: req.params.id}, function(err,doc){
    var idCount = 0;
    if(doc.comments.length < 1){
      idCount = 1;
      doc.comments.push({commentId: idCount, comment: req.body.comment})
    }else{
      var lastIndex = doc.comments.length - 1;
      var lastItem = doc.comments[lastIndex]
      idCount = lastItem.commentId + 1;
      doc.comments.push({commentId: idCount, comment: req.body.comment})
    }
    posts.update({_id: req.params.id}, doc, function (err, doc) {

      if (err) throw err;
      res.redirect('/posts/' + req.params.id)
    })
  })
})






// router.post('/posts/:id/comments/delete', function(req,res,next){
//   posts.findOne({_id: req.params.id}, function(err,doc){
//     var index = doc.comments.indexOf(req.body.comment)
//     doc.comments.splice(index,1);
//     posts.update({_id: req.params.id}, doc, function(err, doc) {
//       res.redirect('/posts/' + req.params.id)
//     })
//   })
// })

router.post('/posts/:id/update', function (req, res, next) {

  posts.findOne({_id: req.params.id}, function(err,doc){
    doc.posts = req.body.posts;
    posts.update({_id: req.params.id}, doc, function (err, doc) {

      if (err) throw err;
      res.redirect('/')
    })
  })

});

router.post('/posts/:id/delete', function (req, res, next) {
  posts.remove({_id: req.params.id}, function (err, doc) {
    if (err) throw err;
    res.redirect('/')

  })

});




module.exports = router;
