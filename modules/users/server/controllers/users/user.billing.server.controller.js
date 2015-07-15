'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
 	path = require('path'),
 	config = require(path.resolve('./config/config')),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
	User = mongoose.model('User');

  // Adds or updates a users card.

  exports.postBilling = function(req, res, next){
    var stripeToken = req.body.stripeToken;

    if(!stripeToken){
      // req.flash('errors', { msg: 'Please provide a valid card.' });
      return res.redirect(req.redirect.failure);
    }

    User.findById(req.user.id, function(err, user) {
      if (err) return next(err);

      user.setCard(stripeToken, function (err) {
        if (err) {
          if(err.code && err.code === 'card_declined'){
            // req.flash('errors', { msg: 'Your card was declined. Please provide a valid card.' });
            return res.redirect(req.redirect.failure);
          }
          // req.flash('errors', { msg: 'An unexpected error occurred.' });
          return res.redirect(req.redirect.failure);
        }
        // req.flash('success', { msg: 'Billing has been updated.' });
        res.redirect(req.redirect.success);
      });
    });
  };


exports.postPlan = function(req, res, next){
  var plan = req.body.plan;
  var stripeToken = null;

  if(plan){
    plan = plan.toLowerCase();
  }

  if(req.user.stripe.plan === plan){
    // req.flash('info', {msg: 'The selected plan is the same as the current plan.'});
    return res.redirect(req.redirect.success);
  }

  if(req.body.stripeToken){
    stripeToken = req.body.stripeToken;
  }

  if(!req.user.stripe.last4 && !req.body.stripeToken){
    // req.flash('errors', {msg: 'Please add a card to your account before choosing a plan.'});
    return res.redirect(req.redirect.failure);
  }

  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user.setPlan(plan, stripeToken, function (err) {
      var msg;

      if (err) {
        if(err.code && err.code === 'card_declined'){
          msg = 'Your card was declined. Please provide a valid card.';
        } else if(err && err.message) {
          msg = err.message;
        } else {
          msg = 'An unexpected error occurred.';
        }

        // req.flash('errors', { msg:  msg});
        return res.redirect(req.redirect.failure);
      }
      // req.flash('success', { msg: 'Plan has been updated.' });
      res.redirect(req.redirect.success);
    });
  });
};
