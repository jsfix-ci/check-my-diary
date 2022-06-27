import type { Response, Request } from 'express'
import { setUpMaintenance } from './setUpMaintenance'
import config from '../../config'

jest.mock('../../config', () => ({
  maintenance: { start: '1979-10-12T07:28:00', end: '1979-10-12T14:28:00' },
}))
jest.mock('express', () => ({
  Router: () => ({
    get: jest.fn(),
  }),
}))

describe('maintenance middleware', () => {
  const router = setUpMaintenance()
  const maintenance = (router.get as jest.Mock).mock.calls[0][1]

  const nextMock = jest.fn()
  const renderMock = jest.fn()
  const csrfToken = 'SQUIRREL!'
  let res: Response
  let req: Request
  beforeEach(() => {
    res = { render: renderMock, locals: { csrfToken } } as unknown as Response
    req = { authUrl: 'someurl', user: { username: 'user', employeeName: 'employee' } } as unknown as Request
    jest.spyOn(Date, 'now').mockImplementation(() => new Date('1979-10-12T08:50:00.000Z').getTime())
  })
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('with a current maintenance period', () => {
    beforeEach(() => {
      maintenance(req, res, nextMock)
    })
    it('should render the maintenance page', () => {
      expect(renderMock).toHaveBeenCalledTimes(1)
      expect(renderMock).toHaveBeenCalledWith('pages/maintenance', {
        startDateTime: '07:28 on Friday 12th October',
        endDateTime: '14:28 on Friday 12th October',
        csrfToken,
        employeeName: 'employee',
        authUrl: 'someurl',
      })
    })
    it('should not call next', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
  })
  describe('with an expired maintenance period', () => {
    beforeEach(() => {
      config.maintenance.end = '1979-10-12T08:00:00'
      maintenance(req, res, nextMock)
    })
    it('should not render the maintenance page', () => {
      expect(renderMock).not.toHaveBeenCalled()
    })
    it('should call next', () => {
      expect(nextMock).toHaveBeenCalledTimes(1)
    })
  })
  describe('with no maintenance period', () => {
    beforeEach(() => {
      config.maintenance = { start: undefined, end: undefined }
      maintenance(req, res, nextMock)
    })
    it('should not render the maintenance page', () => {
      expect(renderMock).not.toHaveBeenCalled()
    })
    it('should call next', () => {
      expect(nextMock).toHaveBeenCalledTimes(1)
    })
  })
})