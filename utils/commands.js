
/**
 * Re-orders the array to the given mapping
 * Useful for having multiple ways of saying things
 *
 * @param {Array<Number>} mapping A list of indexes
 *
 * @example:
 *      /(heater)(window)(on)/
 *      /(window)(heater)(on)/  - reorder([2, 1, 3])
 */
const reorder = mapping => match =>
    mapping.map(index => match[index])
    .concat(match.slice(mapping.length + 1));

const fixed = str => () => str.split(' ');

const identity = x => x;
const command = (reg, mappingList=[identity]) =>
    [reg, Array.isArray(mappingList) ? mappingList : [mappingList]]

module.exports = [
    command(/(heater)s?.+(lamp|window).+(on|off)/i),
    command(/(lamp|window)s?.+(heater)s?.+(on|off)/i, reorder([1, 0, 2])),

    command(/heaters?.+\boff/i, [fixed('heater lamp off'), fixed('heater window off')]),
    command(/heaters?.+\bon/i, [fixed('heater lamp on'), fixed('heater window on')]),
];
