const log = require('../../log')

function getStartMonth() {
  const now = new Date()
  return [now.getFullYear(), `0${now.getMonth() + 1}`.slice(-2), '01'].join('-')
}

function get2faCode() {
  return Math.floor(Math.random() * 899999 + 100000)
}

function isNullOrEmpty(str) {
  if (
    typeof str === 'undefined' ||
    !str ||
    str.length === 0 ||
    str === '' ||
    !/[^\s]/.test(str) ||
    /^\s*$/.test(str) ||
    str.replace(/\s/g, '') === ''
  ) {
    return true
  }
  return false
}

function areDatesTheSame(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    // getMonth is 0-indexed
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function getAuthErrorDescription(error) {
  log.info(`login error description = ${error}`)
  log.info(
    `login response error description = ${
      error.response && error.response.data && error.response.data.error_description
    }`,
  )
  let type = 'The username or password you have entered is invalid.'
  if (error !== null && error.message !== '') {
    if (error.message.includes('No Sms or Email address returned for QuantumId')) {
      type =
        'You have not been setup on Check My Diary. Please contact us via: checkmydiary@digital.justice.gov.uk if you would like to be included.'
    } else if (error.message.includes('Sms or Email address null or empty for QuantumId')) {
      type =
        'You have not been setup with a email address or mobile number. Please contact us via: checkmydiary@digital.justice.gov.uk.'
    } else if (error.message.includes('Sms or Email address both set to false for QuantumId')) {
      type =
        'Your email address or mobile number has not been enabled. Please contact us via: checkmydiary@digital.justice.gov.uk.'
    } else if (error.message.includes('email_address Not a valid email address')) {
      type =
        'Your email address stored with Check My Diary is not valid. Please contact us via: checkmydiary@digital.justice.gov.uk.'
    } else if (
      error.message.includes('phone_number Not enough digits') ||
      error.message.includes('phone_number Must not contain letters or symbols') ||
      error.message.includes('phone_number Too many digits')
    ) {
      type =
        'Your mobile number stored with Check My Diary is not valid. Please contact us via: checkmydiary@digital.justice.gov.uk.'
    }
  }
  return type
}

function calculateMaintenanceDates(maintenanceStartDateTime, maintenanceEndDateTime) {
  let showMaintenancePage = false
  const currentDateTime = new Date()

  if (maintenanceEndDateTime !== null) {
    showMaintenancePage = !!(currentDateTime >= maintenanceStartDateTime && currentDateTime <= maintenanceEndDateTime)
  } else {
    showMaintenancePage = areDatesTheSame(currentDateTime, maintenanceStartDateTime)
  }

  return showMaintenancePage
}

module.exports = {
  getStartMonth,
  get2faCode,
  isNullOrEmpty,
  areDatesTheSame,
  getAuthErrorDescription,
  calculateMaintenanceDates,
}