const niv = require('node-input-validator');
/**
 * @param {Object} messages
 * @param {string?=en} language
 */
niv.extendMessages({
  required: 'El campo :attribute es obligatorio.',
  email: 'El campo :attribute no es un correo electrónico válido.',
  string: "El campo :attribute debe ser de tipo texto.",
  minLength: "El campo :attribute debe contener mínimo :arg0 caracteres.",
  same: "Los campos :attribute y :arg0 no coinciden",
  // even: 'The value of the field must be even number.',
  // status: 'Invalid status'
}, 'es');

niv.setLang('es');