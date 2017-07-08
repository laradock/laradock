#!/bin/bash

error()
{
  echo "ERR: $@" 1>&2
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
