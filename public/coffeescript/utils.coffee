
exports.alphaNumSort = (m, n) ->
  a = m.toLowerCase()
  b = n.toLowerCase()
  return 0  if a is b
  if isNaN(m) or isNaN(n)
    (if a > b then 1 else -1)
  else
    m - n
