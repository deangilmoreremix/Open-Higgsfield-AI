import validator from 'validator';

export const isEmail = ({ message = 'It should be email' } = {}) => value =>
  (!validator.isEmail(value) ? message : null);
export const isNumber = ({ message = 'It should be number', ...restOptions } = {}) => value =>
  (!validator.isFloat(value, restOptions) ? message : null);
export const number = ({ message = 'It should be number' } = {}) => value =>
  (Number.isNaN(parseFloat(value, 10)) ? message : null);
export const positive = ({ message = 'It should be positive value' } = {}) => value =>
  (value <= 0 ? message : null);
export const required = ({ message = 'The field is required' } = {}) => value =>
  (!value && value !== 0 ? message : null);
export const matchField = ({ message = 'Field doesn\'t match', matchingField }) => {
  if (!matchingField) {
    throw new Error('matchingField is not provided');
  }
  return (value, values) => (value !== values[matchingField] ? message : null);
};

export default {
  isEmail,
  isNumber,
  number,
  positive,
  required,
  matchField,
};
