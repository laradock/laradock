#!/bin/bash

compose_option()
{
  local dcpath="$(contains "$1" "${all_modules[@]}"; ifelse "$LARADOCK_ROOT/$1" "$1")"
  if [[ -e "${dcpath}/docker-compose.yml" ]]; then
    echo -n " -f ${dcpath}/docker-compose.yml"
  fi
}

output_dockercompose_args()
{
  compose_option "$LARADOCK_ROOT/index"
  [[ $# -eq 0 || ${options[a]} ]] && foreach compose_option "${all_modules[@]}"
  foreach compose_option "$@"
}
