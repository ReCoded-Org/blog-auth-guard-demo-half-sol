const express = require('express');
const Article = require('./../models/article');
const authenticate = require('../middlewares/authenticate');
const router = express.Router();

/*router.get('/todos', function() {
  return (req, res, next) => {

  }
}, () => {

});*/

// fn req, res, next

router.get('/new', authenticate(), (req, res) => {
  res.render('articles/new', { article: new Article() });
});

router.get('/edit/:id', authenticate(), async (req, res) => {
  const article = await Article.findById(req.params.id);
  res.render('articles/edit', { article: article });
});

router.get('/:slug', async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug });
  if (article == null) res.redirect('/');
  res.render('articles/show', { article: article });
});

router.post(
  '/',
  async (req, res, next) => {
    req.article = new Article();
    next();
  },
  saveArticleAndRedirect('new')
);

router.put(
  '/:id',
  async (req, res, next) => {
    req.article = await Article.findById(req.params.id);
    next();
  },
  saveArticleAndRedirect('edit')
);

router.delete('/:id', authenticate(), async (req, res) => {
  const article = await Article.findOne({_id: req.params.id});

  if (!article) {
    return res.status(404).send();
  }

  if (article.author !== req.user._id) {
     // forbidden
    res.status(403).send();
  }

  await Article.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article;
    article.title = req.body.title;
    article.snippet = req.body.snippet;
    article.markdown = req.body.markdown;
    try {
      article.author = req.session?.user?._id ?? null;
      article = await article.save();
      res.redirect(`/articles/${article.slug}`);
    } catch (e) {
      console.log(e);
      res.render(`articles/${path}`, { article: article });
    }
  };
}

module.exports = router;
