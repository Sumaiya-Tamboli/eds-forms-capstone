/**
 * Personal Loan Form - Interactive Features
 * Handles show/hide logic for conditional fields
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    initPersonalLoanForm();
  });

  function initPersonalLoanForm() {
    const form = document.querySelector('.field-personal-loan-offer');
    if (!form) return;

    // Initialize ID Type toggle (Pan Card / Date of Birth)
    initIdTypeToggle();

    // Initialize form validation
    initFormValidation();

    // Initialize date picker if needed
    initDatePicker();

    // Initialize checkboxes
    initCheckboxes();

    // Initialize mobile formatting
    initMobileFormatting();
  }

  /**
   * Show/Hide Pan Number or Date of Birth based on ID Type selection
   */
  function initIdTypeToggle() {
    const idTypeRadios = document.querySelectorAll('input[name="id_type"]');
    const panNumberField = document.querySelector('.field-pan-number');
    const dobField = document.querySelector('.field-date-of-birth');

    if (!idTypeRadios.length || !panNumberField || !dobField) return;

    // Set initial state based on checked radio
    updateIdTypeFields();

    // Add change listeners
    idTypeRadios.forEach(radio => {
      radio.addEventListener('change', updateIdTypeFields);
    });

    function updateIdTypeFields() {
      const selectedValue = document.querySelector('input[name="id_type"]:checked')?.value;

      if (selectedValue === 'pan_card') {
        // Show Pan Number field, hide DOB field
        panNumberField.style.display = 'block';
        panNumberField.querySelector('input').setAttribute('required', 'required');
        
        dobField.style.display = 'none';
        dobField.querySelector('input').removeAttribute('required');
      } else if (selectedValue === 'date_of_birth') {
        // Show DOB field, hide Pan Number field
        dobField.style.display = 'block';
        dobField.querySelector('input').setAttribute('required', 'required');
        
        panNumberField.style.display = 'none';
        panNumberField.querySelector('input').removeAttribute('required');
      }
    }
  }

  /**
   * Form validation
   */
  function initFormValidation() {
    const form = document.querySelector('.field-personal-loan-offer form');
    if (!form) return;

    const submitButton = document.querySelector('.field-view-loan-eligibility button');
    
    if (submitButton) {
      submitButton.addEventListener('click', function(e) {
        // Check if mandatory consent checkbox is checked
        const mandatoryConsent = document.querySelector('input[name="consent_collection_processing"]');
        
        if (mandatoryConsent && !mandatoryConsent.checked) {
          e.preventDefault();
          alert('Please accept the mandatory consent to proceed.');
          mandatoryConsent.focus();
          return false;
        }

        // Validate mobile number (basic 10-digit check)
        const mobileInput = document.querySelector('input[name="aadhaar_linked_mobile_number"]');
        if (mobileInput) {
          const mobileValue = mobileInput.value.replace(/\D/g, '');
          if (mobileValue.length !== 10) {
            e.preventDefault();
            alert('Please enter a valid 10-digit mobile number.');
            mobileInput.focus();
            return false;
          }
        }

        // Validate Pan Card format if Pan Card is selected (basic check)
        const idType = document.querySelector('input[name="id_type"]:checked')?.value;
        if (idType === 'pan_card') {
          const panInput = document.querySelector('input[name="Pan number"]');
          if (panInput && panInput.value) {
            const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!panPattern.test(panInput.value.toUpperCase())) {
              e.preventDefault();
              alert('Please enter a valid PAN number (e.g., ABCDE1234F).');
              panInput.focus();
              return false;
            }
          }
        }
      });
    }
  }

  /**
   * Date picker initialization
   */
  function initDatePicker() {
    const dateInput = document.querySelector('input[name="date_of_birth"]');
    if (!dateInput) return;

    // Set max date to 18 years ago (minimum age requirement)
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const maxDateStr = maxDate.toISOString().split('T')[0];
    
    // Set min date to 100 years ago
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    const minDateStr = minDate.toISOString().split('T')[0];

    // Change input type to date for better UX
    dateInput.setAttribute('type', 'date');
    dateInput.setAttribute('max', maxDateStr);
    dateInput.setAttribute('min', minDateStr);
  }

  /**
   * Checkbox interactions
   */
  function initCheckboxes() {
    // Add visual feedback for checkbox labels
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
      const label = checkbox.nextElementSibling;
      if (label && label.tagName === 'LABEL') {
        checkbox.addEventListener('change', function() {
          if (this.checked) {
            label.style.color = '#1f2937';
          } else {
            label.style.color = '#374151';
          }
        });
      }
    });
  }

  /**
   * Mobile number formatting
   */
  function initMobileFormatting() {
    const mobileInput = document.querySelector('input[name="aadhaar_linked_mobile_number"]');
    if (!mobileInput) return;

    mobileInput.addEventListener('input', function(e) {
      // Remove non-digit characters
      let value = e.target.value.replace(/\D/g, '');
      
      // Limit to 10 digits
      value = value.substring(0, 10);
      
      e.target.value = value;
    });

    // Add placeholder behavior
    mobileInput.setAttribute('maxlength', '10');

    // Add real-time validation
    mobileInput.addEventListener('blur', function() {
      const value = this.value.replace(/\D/g, '');
      const wrapper = this.closest('.text-wrapper');
      
      if (value.length > 0 && value.length !== 10) {
        wrapper.classList.add('field-invalid');
        let errorMsg = wrapper.querySelector('.mobile-error-message');
        if (!errorMsg) {
          errorMsg = document.createElement('div');
          errorMsg.className = 'mobile-error-message';
          errorMsg.style.color = '#ef4444';
          errorMsg.style.fontSize = '12px';
          errorMsg.style.marginTop = '4px';
          errorMsg.textContent = 'Mobile number must be 10 digits';
          wrapper.appendChild(errorMsg);
        }
      } else {
        wrapper.classList.remove('field-invalid');
        const errorMsg = wrapper.querySelector('.mobile-error-message');
        if (errorMsg) errorMsg.remove();
      }
    });
  }

})();
