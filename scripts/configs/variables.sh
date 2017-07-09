#!/bin/bash

declare -a all_modules=(
  'workspace'
  'php-fpm'
  'php-worker'
  'nginx'
  'blackfire'
)

declare -A command_map=(
  ['envvars']='[envvars:template]'
  ['envvars:template']='output_environvars'
  ['envvars:executed']='output_processed_environvars'
  ['dockercompose']='[dockercompose:args]'
  ['dockercompose:args']='output_dockercompose_args'
)

declare -A command_opts=(
  ['envvars:template']=':o:a'
  ['envvars:executed']=':o:a'
)

# A space delimited list of pairs of aliases.
# Each pair consists of the long form and its
# corresponding shorthand, separated by a colon.
declare -A option_aliases=(
  ['envvars:template']="--output:-o --all:-a"
  ['envvars:executed']="--output:-o --all:-a"
)

# Number of columns (width) of the section dividers/headers
# to print into the generated environment variable
# configuration file.
readonly DIV_COLUMNS=60
