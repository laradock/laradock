#!/bin/bash

error()
{
  echo "ERR: $@" 1>&2
}

ifelse()
{
  if [[ 0 -eq $? ]]; then
    "$1" "$2"
  else
    "$1" "$3"
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
