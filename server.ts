/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { initialiseAppInsights, buildAppInsightsClient } from './server/azure-appinsights'

initialiseAppInsights()
buildAppInsightsClient()

import { app, metricsApp } from './server/index'
import logger from './log'

app.listen(app.get('port'), () => {
  logger.info(`Server listening on port ${app.get('port')}`)
})

metricsApp.listen(metricsApp.get('port'), () => {
  logger.info(`Metrics server listening on port ${metricsApp.get('port')}`)
})
