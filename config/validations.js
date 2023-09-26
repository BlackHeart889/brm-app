const niv = require('node-input-validator');
/**
 * @param {Object} messages
 * @param {string?=en} language
 */
niv.extendMessages({
  required: 'El campo :attribute es obligatorio.',
  email: 'E-mail must be a valid email address.',
  even: 'The value of the field must be even number.',
  status: 'Invalid status'
}, 'es');

niv.setLang('es');