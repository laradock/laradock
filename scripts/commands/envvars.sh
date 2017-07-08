#!/bin/bash

to_bash_script()
{
  sed -re 's/^(.*)=.*$/\1=$\{\1\}/' \
       -e 's/`/\\`/g' \
       -e '/^#/ s/\$/\\$/g' \
       -e '1 i\cat - <<EOF' \
       -e '$ a\EOF'
}

echo_environ()
{
  local transform='echo_divheader'
  if [ $1 == '--1st' ]; then
    transform='cat'; shift
  fi
  if [[ -e "./$1/.env.example" ]]; then
    cat "./$1/.env.example" | $transform | prepend_empty_line
  fi
}

output_environvars()
{
  [[ $# -eq 0 ]] && set ${all_modules[@]}

  local output="${options[o]:-/dev/stdout}"

  ( # output
    echo_header "General Setup"
    echo_environ --1st index
    echo_header "Containers Customization"
    foreach echo_environ "$@"
  ) > "$output"
}

output_processed_environvars()
{
  local output="${options[o]:-/dev/stdout}"

  output_environvars | (evaluate ; source "$@" ; \
    (output_environvars | to_bash_script | evaluate) \
  ) > "$output"
}
