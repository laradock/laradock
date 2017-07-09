#!/bin/bash

execute_command()
{
  if [[ -z "${command_map[$COMMAND]}" ]]; then
    error "unrecognized COMMAND '$COMMAND'"
  elif [[ "${command_map[$COMMAND]}" == '['*']' ]]; then
    COMMAND="${command_map[$COMMAND]#\[}"
    COMMAND="${COMMAND%\]}"
    execute_command
  else
    replace_option_aliases "${arguments[@]}"
    process_command_arguments "${arguments[@]}"
    "${command_map[$COMMAND]}" "${arguments[@]}"
  fi
}
