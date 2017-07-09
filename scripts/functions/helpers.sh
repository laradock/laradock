#!/bin/bash

error()
{
  echo "ERR: $@" 1>&2
}

ifelse()
{
  if [[ 0 -eq $? ]]; then
    echo "$1"
  else
    echo "$2"
  fi
}

foreach()
{
  local element
  for element in "${@:2}"; do
    "$1" "$element"
  done
}

contains()
{
  local element
  for element in "${@:2}"; do
    [[ "$element" == "$1" ]] && return 0
  done
  return 1
}

evaluate()
{
  source /dev/stdin
}
