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
  maxLength: "El campo :attribute debe contener máximo :arg0 caracteres.",
  same: "Los campos :attribute y :arg0 no coinciden",
  numeric: "El campo :attribute debe ser de tipo numérico.",
  digitsBetween: "El campo :attribute debe tener entre :arg0 y :arg1 dígitos.",
  date: "El campo :attribute no es una fecha válida",
  dateFormat: "El campo :attribute debe tener la estructura :arg0",
  integer: "El campo :attribute debe ser de tipo entero",
  min: "El campo :attribute no puede ser menor a :arg0",
  array: "El campo :attribute debe ser de tipo Array."
  // even: 'The value of the field must be even number.',
  // status: 'Invalid status'
}, 'es');

niv.setLang('es');