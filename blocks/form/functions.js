/**
 * Get Full Name
 * @name getFullName Concats first name and last name
 * @param {string} firstname in Stringformat
 * @param {string} lastname in Stringformat
 * @return {string}
 */
function getFullName(firstname, lastname) {
  return `${firstname} ${lastname}`.trim();
}

/**
 * Custom submit function
 * @param {scope} globals
 */
function submitFormArrayToString(globals) {
  const data = globals.functions.exportData();
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data[key] = data[key].join(',');
    }
  });
  globals.functions.submitForm(data, true, 'application/json');
}

/**
 * Calculate the number of days between two dates.
 * @param {*} endDate
 * @param {*} startDate
 * @returns {number} returns the number of days between two dates
 */
function days(endDate, startDate) {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  // return zero if dates are valid
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const diffInMs = Math.abs(end.getTime() - start.getTime());
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

/**
* Masks the first 5 digits of the mobile number with *
* @param {*} mobileNumber
* @returns {string} returns the mobile number with first 5 digits masked
*/
function maskMobileNumber(mobileNumber) {
  if (!mobileNumber) {
    return '';
  }
  const value = mobileNumber.toString();
  // Mask first 5 digits and keep the rest
  return ` ${'*'.repeat(5)}${value.substring(5)}`;
}

// eslint-disable-next-line import/prefer-default-export
export {
  getFullName, days, submitFormArrayToString, maskMobileNumber,startOtpTimer,resendOtp
};




 
let timerInterval = null;
let timerValue = 40;
let attemptsLeft = 3;
const totalAttempts = 3;
 
/**
 * Starts a 40 second countdown timer
 * Updates timer field and shows/hides resend OTP button automatically
 * @returns {string} initial timer display value
 */
function startOtpTimer() {
  timerValue = 40;
 
  if (timerInterval) {
    clearInterval(timerInterval);
  }
 
  const timerInput = document.querySelector('input[name="timer"]');
  const timerWrapper = timerInput?.closest('.field-wrapper');
  const resendBtn = document.querySelector('button[name="resend_otp"]');
  const resendWrapper = resendBtn?.closest('.field-wrapper');
 
  // Show timer, hide resend at start
  if (timerWrapper) timerWrapper.style.setProperty('display', '', 'important');
  if (resendWrapper) {
    resendWrapper.classList.remove('hidden');
    resendWrapper.classList.remove('hide');
    resendWrapper.style.setProperty('display', 'none', 'important');
  }
  if (resendBtn) resendBtn.disabled = true;
 
  timerInterval = setInterval(() => {
    timerValue--;
 
    if (timerInput) {
      timerInput.value = `Resend OTP in ${timerValue} secs`;
    }
 
    if (timerValue <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
 
      // Hide timer
      if (timerWrapper) {
        timerWrapper.style.setProperty('display', 'none', 'important');
      }
 
      // Show resend button only if attempts remain
      if (attemptsLeft > 0) {
        if (resendWrapper) {
          resendWrapper.classList.remove('hidden');
          resendWrapper.classList.remove('hide');
          resendWrapper.style.setProperty('display', '', 'important');
        }
        if (resendBtn) resendBtn.disabled = false;
      }
    }
  }, 1000);
 
  return `Resend OTP in ${timerValue} secs`;
}
 
/**
 * Handles resend OTP click - decreases attempts and restarts timer
 * @returns {string} updated attempts display value
 */
function resendOtp() {
  const attemptsInput = document.querySelector('input[name="otp_attempts_left"]');
  const resendBtn = document.querySelector('button[name="resend_otp"]');
  const resendWrapper = resendBtn?.closest('.field-wrapper');
 
  // Decrease attempts
  attemptsLeft--;
 
  // Update attempts field display
  if (attemptsInput) {
    attemptsInput.value = `${attemptsLeft}/${totalAttempts} attempts left`;
  }
 
  if (attemptsLeft <= 0) {
    // No more attempts - hide resend button permanently
    if (resendWrapper) {
      resendWrapper.style.setProperty('display', 'none', 'important');
    }
    if (resendBtn) resendBtn.disabled = true;
 
    return `0/${totalAttempts} attempts left`;
  }
 
  // Still have attempts - restart timer
  startOtpTimer();
 
  return `${attemptsLeft}/${totalAttempts} attempts left`;
}
 
 