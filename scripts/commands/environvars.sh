#!/bin/bash

to_load_script()
{
  sed -re 's/^([^=]*)=(.*)$/'$1'[\1]="\2"/'
}

to_output_script()
{
  sed -re 's/^([^=]*)=.*$/\1=$\{'$1'[\1]\}/' \
       -e 's/`/\\`/g' \
       -e '/^#/ s/\$/\\$/g' \
       -e '1 i\cat - <<EOF' \
       -e '$ a\EOF'
}

echo_environ()
{
  local nodiv=$(test "$1" == '--nodiv'; ifelse true false)
  local transform=$($nodiv; ifelse cat echo_divheader); if $nodiv; then shift; fi
  local envpath="$(contains "$1" "${all_modules[@]}"; ifelse "$LARADOCK_ROOT/$1" "$1")"
  if [[ -e "${envpath}/.env.example" ]]; then
    cat "${envpath}/.env.example" | $transform | prepend_empty_line
  fi
}

output_environvars()
{
  [[ $# -eq 0 || ${options[a]} ]] && set "${all_modules[@]}" "$@"

  local index="$LARADOCK_ROOT/index"
  local output="${options[o]:-/dev/stdout}"

  ( # output
    echo_header "General Setup"
    echo_environ --nodiv "$index"
    echo_header "Containers Customization"
    foreach echo_environ "$@"
    echo_header "Miscellaneous"
    echo_environ --nodiv "$index/misc"
  ) > "$output"
}

output_processed_environvars()
{
  local output="${options[o]:-/dev/stdout}"
  local -A environvars=( )
  local content="$(output_environvars)"

  (echo "$content"; cat "$@") | to_load_script environvars | \
    (evaluate; echo "$content" | to_output_script environvars | evaluate > "$output")
}
