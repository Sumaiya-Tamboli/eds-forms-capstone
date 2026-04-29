/**
 * Personal Loan Offer Form - Interactive Features
 * Handles show/hide logic and validation
 */

(function() {
  'use strict';

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const form = document.querySelector('.field-personal-loan-offer');
    if (!form) return;

    initIdTypeToggle();
    initFormValidation();
    initMobileNumberFormatting();
    initDateField();
  }

  /**
   * Toggle between Pan Card and Date of Birth fields
   */
  function initIdTypeToggle() {
    const idTypeRadios = document.querySelectorAll('input[name="id_type"]');
    const panField = document.querySelector('.field-pan-number');
    const dobField = document.querySelector('.field-date-of-birth');

    if (!idTypeRadios.length || !panField || !dobField) return;

    // Set initial state
    updateFields();

    // Listen for changes
    idTypeRadios.forEach(radio => {
      radio.addEventListener('change', updateFields);
    });

    function updateFields() {
      const selectedValue = document.querySelector('input[name="id_type"]:checked')?.value;

      if (selectedValue === 'pan_card') {
        // Show Pan, hide DOB
        panField.style.display = 'block';
        panField.querySelector('input').setAttribute('required', 'required');
        panField.setAttribute('data-required', 'true');
        
        dobField.style.display = 'none';
        dobField.querySelector('input').removeAttribute('required');
        dobField.removeAttribute('data-required');
      } else if (selectedValue === 'date_of_birth') {
        // Show DOB, hide Pan
        dobField.style.display = 'block';
        dobField.querySelector('input').setAttribute('required', 'required');
        dobField.setAttribute('data-required', 'true');
        
        panField.style.display = 'none';
        panField.querySelector('input').removeAttribute('required');
        panField.removeAttribute('data-required');
      }
    }
  }

  /**
   * Form validation before submission
   */
  function initFormValidation() {
    const submitButton = document.querySelector('.field-view-loan-eligibility button');
    if (!submitButton) return;

    submitButton.addEventListener('click', function(e) {
      // Validate mobile number
      const mobileInput = document.querySelector('input[name="aadhaar_linked_mobile_number"]');
      if (mobileInput) {
        const value = mobileInput.value.replace(/\D/g, '');
        if (!value || value.length !== 10) {
          e.preventDefault();
          showError(mobileInput, 'Please enter a valid 10-digit mobile number');
          return false;
        }
      }

      // Validate ID type selection
      const idType = document.querySelector('input[name="id_type"]:checked');
      if (!idType) {
        e.preventDefault();
        alert('Please select an identification type');
        return false;
      }

      // Validate Pan Card if selected
      if (idType.value === 'pan_card') {
        const panInput = document.querySelector('input[name="Pan number"]');
        if (panInput) {
          const panValue = panInput.value.toUpperCase().trim();
          const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
          
          if (!panValue) {
            e.preventDefault();
            showError(panInput, 'Please enter your PAN number');
            return false;
          }
          
          if (!panPattern.test(panValue)) {
            e.preventDefault();
            showError(panInput, 'Please enter a valid PAN number (e.g., ABCDE1234F)');
            return false;
          }
        }
      }

      // Validate Date of Birth if selected
      if (idType.value === 'date_of_birth') {
        const dobInput = document.querySelector('input[name="date_of_birth"]');
        if (dobInput && !dobInput.value) {
          e.preventDefault();
          showError(dobInput, 'Please enter your date of birth');
          return false;
        }
      }

      // Validate income source
      const incomeSource = document.querySelector('input[name="income_source"]:checked');
      if (!incomeSource) {
        e.preventDefault();
        alert('Please select your source of income');
        return false;
      }

      // Validate mandatory consent
      const mandatoryConsent = document.querySelector('input[name="consent_collection_processing"]');
      if (mandatoryConsent && !mandatoryConsent.checked) {
        e.preventDefault();
        alert('Please accept the mandatory consent to proceed');
        mandatoryConsent.focus();
        return false;
      }

      // All validations passed
      clearAllErrors();
    });
  }

  /**
   * Mobile number formatting and validation
   */
  function initMobileNumberFormatting() {
    const mobileInput = document.querySelector('input[name="aadhaar_linked_mobile_number"]');
    if (!mobileInput) return;

    // Only allow digits
    mobileInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      value = value.substring(0, 10);
      e.target.value = value;
    });

    // Validate on blur
    mobileInput.addEventListener('blur', function() {
      const value = this.value.replace(/\D/g, '');
      
      if (value.length > 0 && value.length !== 10) {
        showError(this, 'Mobile number must be 10 digits');
      } else {
        clearError(this);
      }
    });

    // Clear error on focus
    mobileInput.addEventListener('focus', function() {
      clearError(this);
    });

    mobileInput.setAttribute('maxlength', '10');
    mobileInput.setAttribute('inputmode', 'numeric');
  }

  /**
   * Date field initialization
   */
  function initDateField() {
    const dateInput = document.querySelector('input[name="date_of_birth"]');
    if (!dateInput) return;

    // Set date constraints
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());

    dateInput.setAttribute('type', 'date');
    dateInput.setAttribute('max', maxDate.toISOString().split('T')[0]);
    dateInput.setAttribute('min', minDate.toISOString().split('T')[0]);

    // Validate on change
    dateInput.addEventListener('change', function() {
      const selectedDate = new Date(this.value);
      
      if (selectedDate > maxDate) {
        showError(this, 'You must be at least 18 years old');
        this.value = '';
      } else if (selectedDate < minDate) {
        showError(this, 'Please enter a valid date');
        this.value = '';
      } else {
        clearError(this);
      }
    });
  }

  /**
   * Show error message for a field
   */
  function showError(input, message) {
    const wrapper = input.closest('.field-wrapper');
    if (!wrapper) return;

    // Remove existing error
    clearError(input);

    // Add error class
    wrapper.classList.add('field-invalid');
    input.style.borderColor = '#ef4444';

    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error-message';
    errorDiv.style.color = '#ef4444';
    errorDiv.style.fontSize = '11px';
    errorDiv.style.marginTop = '4px';
    errorDiv.textContent = message;

    wrapper.appendChild(errorDiv);
  }

  /**
   * Clear error message for a field
   */
  function clearError(input) {
    const wrapper = input.closest('.field-wrapper');
    if (!wrapper) return;

    wrapper.classList.remove('field-invalid');
    input.style.borderColor = '';

    const errorMsg = wrapper.querySelector('.field-error-message');
    if (errorMsg) {
      errorMsg.remove();
    }
  }

  /**
   * Clear all error messages
   */
  function clearAllErrors() {
    const errorMessages = document.querySelectorAll('.field-error-message');
    errorMessages.forEach(msg => msg.remove());

    const invalidFields = document.querySelectorAll('.field-invalid');
    invalidFields.forEach(field => field.classList.remove('field-invalid'));

    const inputs = document.querySelectorAll('.field-personal-loan-offer input');
    inputs.forEach(input => {
      input.style.borderColor = '';
    });
  }

})();
