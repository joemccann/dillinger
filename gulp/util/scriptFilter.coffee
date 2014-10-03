
path = require("path")

# Filters out non .coffee and .js files. Prevents
# accidental inclusion of possible hidden files
module.exports = (name) ->
  /(\.(js|coffee)$)/i.test path.extname(name)
