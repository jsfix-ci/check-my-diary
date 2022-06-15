import { SuperAgentRequest } from 'superagent'
import moment from 'moment'
import { getMatchingRequests, stubFor } from './wiremock'

const fakeShiftNotifications = [
  {
    description: 'Your activity on Wednesday 29 May 2019 at 17:00 - 17:30 has changed to [Paternity Leave].',
    shiftModified: '2019-05-29T13:53:01.000Z',
    processed: true,
  },
  {
    description: 'Your activity on Wednesday 29 May 2019 at 15:00 - 17:00 has changed to [FMI Training].',
    shiftModified: '2019-05-29T13:46:19.000Z',
    processed: true,
  },
  {
    description: 'Your activity on Wednesday 29 May 2019 at 17:00 - 17:30 has changed to [Late Roll (OSG)].',
    shiftModified: '2019-05-29T13:43:37.000Z',
    processed: true,
  },
  {
    description: 'Your activity on Wednesday 29 May 2019 at 15:00 - 17:00 has changed to [FMI Training].',
    shiftModified: '2019-05-29T13:36:43.000Z',
    processed: true,
  },
]

export default {
  stubNotificationCount: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/notifications\\?processOnRead=false&unprocessedOnly=true',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: fakeShiftNotifications,
      },
    }),

  stubNotificationGet: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/notifications\\?processOnRead=true&unprocessedOnly=false',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: fakeShiftNotifications,
      },
    }),

  stubNotificationPreferencesGet: (body?: object): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/preferences/notifications2',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: body || {
          snoozeUntil: moment().add(3, 'days').format('YYYY-MM-DD'),
          preference: 'SMS',
          sms: '01189998819991197253',
        },
      },
    }),

  stubNotificationPreferencesGet404: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/preferences/notifications2',
      },
      response: {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      },
    }),

  stubNotificationPreferencesSet: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        urlPattern: '/preferences/notifications/details',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    }),

  stubNotificationUpdate: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        urlPattern: '/preferences/notifications/snooze',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    }),

  verifySnooze: async () =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: '/preferences/notifications/snooze',
      })
    ).body.requests,

  verifyDetails: async () =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: '/preferences/notifications/details',
      })
    ).body.requests,
}