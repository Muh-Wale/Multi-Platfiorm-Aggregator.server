// // server/utils/queueDashboard.js
// const { createBullBoard } = require('@bull-board/api');
// const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
// const { ExpressAdapter } = require('@bull-board/express');

// const serverAdapter = new ExpressAdapter();
// createBullBoard({
//     queues: [new BullMQAdapter(scrapeQueue)],
//     serverAdapter
// });

// serverAdapter.setBasePath('/admin/queues');
// app.use('/admin/queues', serverAdapter.getRouter());