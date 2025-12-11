// Form validation utility functions

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number format (10-15 digits)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[\d\s-]{10,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates name (2-50 characters)
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid name
 */
export const isValidName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

/**
 * Validates positive number
 * @param {number} value - Number to validate
 * @returns {boolean} - True if positive number
 */
export const isPositiveNumber = (value) => {
  return !isNaN(value) && parseFloat(value) > 0;
};

/**
 * Validates non-negative number
 * @param {number} value - Number to validate
 * @returns {boolean} - True if non-negative number
 */
export const isNonNegativeNumber = (value) => {
  return !isNaN(value) && parseFloat(value) >= 0;
};

/**
 * Validates positive integer
 * @param {number} value - Number to validate
 * @returns {boolean} - True if positive integer
 */
export const isPositiveInteger = (value) => {
  return Number.isInteger(Number(value)) && Number(value) > 0;
};

/**
 * Validates future date
 * @param {string} dateString - Date string to validate
 * @returns {boolean} - True if date is in the future
 */
export const isFutureDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

/**
 * Validates date (alias for isFutureDate for consistency)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} - True if date is valid and in the future
 */
export const isValidDate = (dateString) => {
  return isFutureDate(dateString);
};

/**
 * Validates amount (alias for isNonNegativeNumber for consistency)
 * @param {number} value - Amount to validate
 * @returns {boolean} - True if valid amount
 */
export const isValidAmount = (value) => {
  return isNonNegativeNumber(value);
};

/**
 * Validates image file type
 * @param {File} file - File to validate
 * @returns {boolean} - True if valid image file
 */
export const isValidImageFile = (file) => {
  if (!file) return false;
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  return validTypes.includes(file.type);
};

/**
 * Validates file size (max 5MB)
 * @param {File} file - File to validate
 * @returns {boolean} - True if file size is within limit
 */
export const isValidFileSize = (file) => {
  if (!file) return false;
  const maxSize = 5 * 1024 * 1024; // 5MB
  return file.size <= maxSize;
};

/**
 * Validates shop name (2-100 characters)
 * @param {string} shopName - Shop name to validate
 * @returns {boolean} - True if valid shop name
 */
export const isValidShopName = (shopName) => {
  return shopName && shopName.trim().length >= 2 && shopName.trim().length <= 100;
};

/**
 * Validates address (10-200 characters)
 * @param {string} address - Address to validate
 * @returns {boolean} - True if valid address
 */
export const isValidAddress = (address) => {
  return address && address.trim().length >= 10 && address.trim().length <= 200;
};

/**
 * Validates tax rate (0-100%)
 * @param {number} rate - Tax rate to validate
 * @returns {boolean} - True if valid tax rate
 */
export const isValidTaxRate = (rate) => {
  return !isNaN(rate) && parseFloat(rate) >= 0 && parseFloat(rate) <= 100;
};

/**
 * Validates required field
 * @param {any} value - Value to validate
 * @returns {boolean} - True if field has value
 */
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined && value !== '';
};

/**
 * Validates worker form data
 * @param {Object} formData - Worker form data
 * @returns {Object} - Errors object (empty if valid)
 */
export const validateWorkerForm = (formData) => {
  const errors = {};

  if (!isValidName(formData.name)) {
    errors.name = 'Name must be between 2 and 50 characters';
  }

  if (!isValidPhone(formData.mobile)) {
    errors.mobile = 'Please enter a valid phone number (10-15 digits)';
  }

  if (!isRequired(formData.skill)) {
    errors.skill = 'Please select a skill';
  }

  if (!isNonNegativeNumber(formData.experience)) {
    errors.experience = 'Experience must be a non-negative number';
  }

  if (!isPositiveNumber(formData.salary)) {
    errors.salary = 'Salary must be a positive number';
  }

  if (formData.profilePhoto && !isValidImageFile(formData.profilePhoto)) {
    errors.profilePhoto = 'Please upload a valid image file (jpg, png, gif)';
  }

  if (formData.profilePhoto && !isValidFileSize(formData.profilePhoto)) {
    errors.profilePhoto = 'File size must be less than 5MB';
  }

  return errors;
};

/**
 * Validates customer form data
 * @param {Object} formData - Customer form data
 * @returns {Object} - Object with isValid flag and errors object
 */
export const validateCustomerForm = (formData) => {
  const errors = {};

  if (!isValidName(formData.name)) {
    errors.name = 'Name must be between 2 and 50 characters';
  }

  if (!isValidPhone(formData.mobile)) {
    errors.mobile = 'Please enter a valid phone number (10-15 digits)';
  }

  if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (formData.photo && !isValidImageFile(formData.photo)) {
    errors.photo = 'Please upload a valid image file (jpg, png, gif)';
  }

  if (formData.photo && !isValidFileSize(formData.photo)) {
    errors.photo = 'File size must be less than 5MB';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates order form data
 * @param {Object} formData - Order form data
 * @returns {Object} - Object with isValid flag and errors object
 */
export const validateOrderForm = (formData) => {
  const errors = {};

  if (!isRequired(formData.selectedCustomer)) {
    errors.selectedCustomer = 'Please select a customer';
  }

  if (!isFutureDate(formData.deliveryDate)) {
    errors.deliveryDate = 'Delivery date must be today or in the future';
  }

  if (!formData.orderItems || formData.orderItems.length === 0) {
    errors.orderItems = 'Please add at least one order item';
  } else {
    formData.orderItems.forEach((item, index) => {
      if (!isPositiveInteger(item.quantity)) {
        errors[`item_${index}_quantity`] = 'Quantity must be a positive integer';
      }
      if (!isPositiveNumber(item.price)) {
        errors[`item_${index}_price`] = 'Price must be a positive number';
      }
    });
  }

  if (!isNonNegativeNumber(formData.advancePayment)) {
    errors.advancePayment = 'Advance payment must be a non-negative number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates profile form data
 * @param {Object} formData - Profile form data
 * @returns {Object} - Object with isValid flag and errors object
 */
export const validateProfileForm = (formData) => {
  const errors = {};

  if (!isValidName(formData.name)) {
    errors.name = 'Name must be between 2 and 50 characters';
  }

  if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!isValidPhone(formData.mobile)) {
    errors.mobile = 'Please enter a valid phone number (10-15 digits)';
  }

  if (!isValidShopName(formData.shopName)) {
    errors.shopName = 'Shop name must be between 2 and 100 characters';
  }

  if (!isValidAddress(formData.address)) {
    errors.address = 'Address must be between 10 and 200 characters';
  }

  if (formData.photo && !isValidImageFile(formData.photo)) {
    errors.photo = 'Please upload a valid image file (jpg, png, gif)';
  }

  if (formData.photo && !isValidFileSize(formData.photo)) {
    errors.photo = 'File size must be less than 5MB';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
