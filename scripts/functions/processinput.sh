#!/bin/bash

process_arguments()
{
  while [[ $# -gt 0 ]]; do
    if [[ "$1" != -* && -z "$COMMAND" ]]; then
      COMMAND="$1"
    else
      arguments+=( "$1" )
    fi
    shift
  done
}

replace_option_aliases()
{
  local -A aliases=( )
  local -a shorten=( )
  if [[ -n "${option_aliases[$COMMAND]}" ]]; then
    for pair in ${option_aliases[$COMMAND]}; do
      aliases["$(echo "$pair" | cut -f1 -d':')"]="$(echo "$pair" | cut -f2 -d':')"
    done
    for argv in "$@"; do
      if [[ -n "${aliases[$argv]}" ]]; then
        shorten+=("${aliases[$argv]}")
      else
        shorten+=("$argv")
      fi
    done
    arguments=("${shorten[@]}")
  fi
}

process_command_arguments()
{
  while getopts "${command_opts[$COMMAND]}" opt; do
    case $opt in
      \?) error "invalid option '-$OPTARG'";;
      :)  error "option -$OPTARG requires an argument";;
      *)  options["$opt"]="${OPTARG:-true}";;
    esac
  done
  shift $((OPTIND-1))
  arguments=("$@")
}
