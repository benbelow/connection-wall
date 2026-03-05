/**
 * Wall configuration format:
 *   groups: array of X groups, each with:
 *     id:    unique string
 *     name:  display name shown when group is completed
 *     items: array of X strings (one per tile)
 *
 * The grid will be X * X tiles (5 groups of 5 = 25 tiles).
 */

export const testConfig = {
  groups: [
    {
      id: 'tea',
      name: 'Types of Tea',
      items: ['Green', 'Black', 'White', 'Oolong', 'Herbal'],
    },
    {
      id: 'langs',
      name: 'Programming Languages',
      items: ['Python', 'Rust', 'Go', 'Swift', 'Kotlin'],
    },
    {
      id: 'planets',
      name: 'Planets',
      items: ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'],
    },
    {
      id: 'instruments',
      name: 'Musical Instruments',
      items: ['Piano', 'Violin', 'Cello', 'Trumpet', 'Flute'],
    },
    {
      id: 'rainbow',
      name: 'Rainbow Colours',
      items: ['Red', 'Orange', 'Yellow', 'Indigo', 'Violet'],
    },
  ],
}
