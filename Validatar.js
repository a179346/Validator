const Constraint = require('./Constraint');

class Validatar {
  constructor() {
    this.constraints = {};
  }

  register(id, message, func) {
    if (typeof (id) !== 'string') { throw new Error('Constraint id is not a string.'); }
    if (!message) throw new Error('Constraint message is required.');
    if (typeof (func) !== 'function') { throw new Error('Constraint check funcction is not a function.'); }
    this.constraints[id] = new Constraint(id, message, func);
  }

  getConstraint(id) {
    if (Object.prototype.hasOwnProperty.call(this.constraints, id)) { return this.constraints[id]; }
    throw new Error(`The constraint id: "${id}" has not been registered.`);
  }

  validate(inputData, rule) {
    const obj = inputData === undefined ? {} : inputData;
    if (!obj || typeof (obj) !== 'object') { throw new Error('The inputData is not an object.'); }
    if (!rule || typeof (rule) !== 'object') { throw new Error('The rule is not an object.'); }
    const keys = Object.keys(rule);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (Object.prototype.hasOwnProperty.call(rule, key)) {
        const ruleVal = rule[key];
        if (Array.isArray(ruleVal)) {
          for (let j = 0; j < ruleVal.length; j += 1) {
            const con = ruleVal[j];
            let constraint;
            if (typeof (con) === 'string') { constraint = this.getConstraint(con); } else { constraint = this.getConstraint(con.constraint); }
            if (!(constraint instanceof Constraint)) { throw new Error('The value in array can not be considered as a constraint.'); }
            if (constraint.func(obj[key]) !== true) {
              return (
                con.message
                || (
                  typeof (constraint.message) === 'string'
                    ? constraint.message.replace(/%\{key\}/g, key).replace(/%\{value\}/g, obj[key])
                    : constraint.message
                )
              );
            }
          }
        } else {
          const result = this.validate(obj[key], rule[key]);
          if (result) return result;
        }
      }
    }
    return undefined;
  }
}

module.exports = Validatar;
