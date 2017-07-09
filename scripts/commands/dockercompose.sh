#!/bin/bash

compose_option()
{
  local dcpath="$(contains "$1" "${all_modules[@]}"; ifelse 'echo' "$LARADOCK_ROOT/$1" "$1")"
  if [[ -e "${dcpath}/docker-compose.yml" ]]; then
    command_arg " -f ${dcpath}/docker-compose.yml"
  fi
}

output_dockercompose_args()
{
  foreach compose_option "${all_modules[@]}"
  foreach compose_option "$@"
}
