const express = require('express');

module.exports = function Index({logger, calendarService}) {

  const router = express.Router();

  router.get('/', async (req, res) => {
    logger.info('GET calendar view');
    const request = await calendarService.getCalendarData();
    res.render('pages/calendar', {tab: 'Calendar', data: calendarService.configureCalendar(request.data), uid: req.session.uid, csrfToken: req.csrfToken()});
  });

  router.get('/details/:date', async (req, res) => {
    logger.info('GET calendar details');
    const request = await calendarService.getCalendarDetails(req.params.date);
    res.render('pages/calendar-details', {data: request.data.task, uid: req.session.uid, csrfToken: req.csrfToken()});
  });

  router.get('/notifications', (req, res) => {
    logger.info('GET notifications view');
    res.render('pages/notifications', {tab: 'Notifications', uid: req.session.uid, csrfToken: req.csrfToken()});
  });

  router.get('/notifications/settings', (req, res) => {
    logger.info('GET notifications view');
    res.render('pages/notification-settings', {uid: req.session.uid, csrfToken: req.csrfToken()});
  });

  router.post('/notifications/settings', (req, res) => {
    logger.info('POST notifications view');
    res.redirect('/notifications');
  });

  router.get('/maintenance', (req, res) => {
    logger.info('GET maintenance view');
    res.render('pages/maintenance', {uid: req.session.uid, csrfToken: req.csrfToken()});
  });

  router.get('*', function(req, res) {
    logger.info('Catch and redirect');
    res.redirect('/');
  });

  return router;
};
