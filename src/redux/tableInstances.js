// this file contains configuration enum object
// for each instance of table in the app
// these instance names are used to separate
// the cache data fetched from server
// and also separate filter config for each table

// for example there is two datatable instance for users
// one for get list of all users
// and another for get list of users of a specific channel
// these two table are in different pages (/users, /channel/:id)
// each one needs a separate storage
// and separate query hook
// we dont want that the table for users of channel A being dependent
// on the query for all users table
// we want to be able to set different filters for each data table

export const tableInstanceNames = {
  channels: 'channels',
  usersOfChannel: 'usersOfChannel',
  messagesOfChannel: 'messagesOfChannel',
  allUsers: 'allUsers',
};